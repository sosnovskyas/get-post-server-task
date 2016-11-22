'use strict';
const fs = require('fs');
const path = require('path');
const url = require('url');
const jade = require('jade');

module.exports = class Router {
  constructor(req, res) {
    this.req = req;
    this.res = res;

    this.maxFileSize = 1048576; // 1MiB

    this.pathname = decodeURI(url.parse(req.url).pathname);

    switch (this.req.method) {
      case 'GET':
        this.onGetRequest(this.pathname);
        break;
      case 'POST':
        this.onPostRequest(this.pathname);
        break;
      case 'DELETE':
        this.onDeleteRequest(this.pathname);
        break;
    }
  }

  /**
   * @return {string}
   */
  onGetRequest(routePath) {
    console.log('onGetRequest', routePath);


    switch (routePath) {
      case '/' :
        let template = new fs.ReadStream(path.join(__dirname, 'index.jade'));
        template.on('readable', () => {
          this.res.end(jade.render(template.read()));
        });
        break;

      case String(routePath.match(/^\/assets\/.*/g)) :
        // ASSETS
        const file = fs.ReadStream(path.join(__dirname, routePath));

        file.pipe(this.res);
        file.on('error', this.streamErrorHandler);

        this.res.on('close', () => {
          file.destroy();
        });
        break;

      case String(routePath.match(/^\/files/g)) :
        // FILES LIST
        console.log('Router: get -> files');
        this.getFilesList(files => {
          console.log('files', files);
          this.res.end(String(files));
        });
        break;

      case String(routePath.match(/^\/files\/.*/g)) :
        // GET FILE
        this.download(routePath);
        break;

      default:
        this.res.statusCode = 501;
        this.res.end('501: неизвестный метод (Method not implemented)');
    }
  }

  onPostRequest(routePath) {
    if (String(routePath.match(/^\/files/g))) {
      console.log('POST: прислан файл');
      const fileName = `files/${routePath.replace(/\/files\//, '')}`;

      this.checkFileExist(fileName)
        .then(
          result => {
            return this.writeFile(result, this.maxFileSize);
          },
          err => {
            if (err == '409') {
              this.res.statusCode = 409;
            } else {
              this.res.statusCode = 500;
            }
            this.res.end(err);
          }
        )
        .then(
          result => {
            console.log(result);
            this.res.end('ok');
          },
          err => {
            console.log(err);
            if (err == '413') {
              // file too large
              this.res.statusCode = 413;
            } else {
              this.res.statusCode = 500;
            }
            this.res.end(err);
          }
        )
    } else {
      this.res.statusCode = 501;
      this.res.end('501: неизвестный метод (Method not implemented)');
    }
  }

  writeFile(fileName, maxSize) {
    let received_bytes = 0;
    let overflow = false;
    let linked = true;

    const writeNext = (chunk) => {
      received_bytes += chunk.length;

      if (received_bytes > maxSize) {
        console.log('ROUTER: writeFile - file too large (overflow)');
        overflow = true;
      }

      if (overflow) {
        if (linked) {
          fs.unlink(fileName, err => {
            if (err) {
              console.error('ROUTER: writeFile() -> unlink fail', err);
            }
            console.log(`fs.unlink ${fileName}`, err);
          });
          linked = false;
        }

        return 413;
      } else {
        fs.appendFile(fileName, chunk, err => {
          if (err) {
            // throw err;
            return 500;
          }
          console.log('The "data to append" was appended to file!');
        });
      }
    };

    return new Promise((resolve, reject) => {
      fs.open(fileName, 'w', (err) => {
        if (err) {
          reject(500);
        }

        this.req
          .on('data', (chunk) => {
            console.log('onData: next chunk');

            const writeResult = writeNext(chunk);

            switch (writeResult) {
              case 413:
                reject('413');
                break;

              case 500:
                reject('500');
                break;

              default:
                console.log('writeNext: ok');
            }
          })
          .on('end', () => {
            resolve('writeFile: ok');
          })
        ;
      });
    });
  }

  checkFileExist(file) {
    return new Promise((resolve, reject) => {
      // console.log('begin exct check');
      fs.stat(file, err => {
        if (err == null) {
          // console.log('File exist');
          reject('409');
        } else if (err.code == 'ENOENT') {
          resolve(file);
        } else {
          reject('Some other error: ' + err.code);
        }
      });
    });
  }

  onDeleteRequest(path) {
    // fs.unlink(path, callback)
    this.checkFileExist(path)
      .then(
        result => {
          console.log('onDeleteRequest: file exist', result);
          fs.unlink((__dirname + result), err => {
            if (err) {
              this.res.statusCode = 404;
              this.res.end('can\'t file delete');
            }
            this.res.end();
          })
        },
        err => {
          this.res.statusCode = 404;
          this.res.end(err);
        }
      )
    ;
    this.res.end(path);
  }

  streamErrorHandler(error) {
    let errRes = {};
    switch (error.code) {
      case 'ENOENT':
        errRes.code = 404;
        errRes.message = 'ERROR 404: File not found';
        break;
      default:
        errRes.code = 500;
        errRes.message = 'Server Error';
        break;
    }

    this.res.statusCode = errRes.code;
    this.res.end(errRes.message);
  }

  getFilesList(cb) {
    console.log('Router: getFilesList(cb) ');
    fs.readdir(path.join(__dirname, 'files'), (err, files) => {
      if (err) {
        // throw Error('ошибка чтения каталога с файлами');
        this.res.statusCode = 404;
        this.res.end('отстутствует каталог с файлами');
      }
      cb(files);
    })
  }

  download(routePath) {
    let filename = routePath.replace(/\/files\//, '');
    // удаляем каки из маршрута, ибо нефига тут вложенности пытаться протолкнуть ))
    filename = filename.replace(/.*[\\\/]/, '');
    const file = fs.ReadStream(path.join(__dirname, 'files', filename));

    file.pipe(this.res);
    file.on('error', this.streamErrorHandler);

    this.res.on('close', () => {
      file.destroy();
    });
  }
}
;
