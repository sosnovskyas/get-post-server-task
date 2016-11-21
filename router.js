'use strict';
const fs = require('fs');
const path = require('path');
const url = require('url');
const jade = require('jade');

module.exports = class Router {
  constructor(req, res) {
    this.req = req;
    this.res = res;

    this.pathname = decodeURI(url.parse(req.url).pathname);

    switch (this.req.method) {
      case 'GET':
        this.GET(this.pathname);
        break;
      case 'POST':
        this.POST(this.pathname);
        break;
      case 'DELETE':
        this.DELETE(this.pathname);
        break;
    }
  }

  /**
   * @return {string}
   */
  GET(routePath) {
    console.log('GET', routePath);


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
        this.res.statusCode = 404;
        this.res.end('404: Такой путь не найден');
    }


  }

  POST(routePath) {
    if (String(routePath.match(/^\/files/g))) {
      console.log('POST: прислан файл');
      let body = '';
      this.req
        .on('data', function (chunk) {
          body += chunk;
        })
        .on('end', function () {
          fs.writeFile(file);
          res.writeHead(200);
          console.log(body);
          res.end('ok');
        });

      this.res.end(path);
    }
  }

  DELETE(path) {
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
      if (err) throw Error('ошибка чтения каталога с файлами');
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
};
