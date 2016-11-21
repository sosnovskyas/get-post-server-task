'use strict';
const fs = require('fs');
const path = require('path');
const url = require('url');
const jade = require('jade');


module.exports = (req, res) => {
  const getFilesList = (cb) => {
    fs.readdir(path.join(__dirname, 'files'), (err, files) => {
      if (err) throw Error('ошибка чтения каталога с файлами');
      cb(files);
    })
  };
  const streamErrorHandler = error => {
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

    res.statusCode = errRes.code;
    res.end(errRes.message);
  };

  const downloadRouteHandler = (routePath) => {
    let filename = routePath.replace(/\/files\//, '');
    // удаляем каки из маршрута, ибо нефига тут вложенности пытаться протолкнуть ))
    filename = filename.replace(/.*[\\\/]/, '');
    const file = fs.ReadStream(path.join(__dirname, 'files', filename));

    console.log('downloadRouteHandler', path.join(__dirname, 'files', filename));
    file.pipe(res);
    file.on('error', streamErrorHandler);

    res.on('close', () => {
      file.destroy();
    });
  };

  let pathname = decodeURI(url.parse(req.url).pathname);

  switch (req.method) {
    case 'GET':
      switch (pathname) {
        case '/':
          // отдачу файлов следует переделать "правильно", через потоки, с нормальной обработкой ошибок
          let template = new fs.ReadStream(path.join(__dirname, 'index.jade'));
          template.on('readable', () => {
            res.end(jade.render(template.read()));
          });

          template.on('error', streamErrorHandler);
          break;

        case String(pathname.match(/^\/assets\/.*/g)): {
          const file = fs.ReadStream(path.join(__dirname, pathname));
          file.pipe(res);
          file.on('error', streamErrorHandler);
          res.on('close', () => {
            file.destroy();
          });
        }
          break;

        case String(pathname.match(/^\/files/g)):
          getFilesList(files => {
            res.end(String(files));
          });
          break;
        case String(pathname.match(/^\/files\/.*/g)):
          downloadRouteHandler(pathname);
          break;

        default:
          res.statusCode = 400;
          res.end('плохой роут');
      }
      break;

    case 'POST':
      if (String(pathname.match(/^\/files/g))) {
        //
      }
      break;
    case 'DELETE':
      break;
    default:
      res.statusCode = 502;
      res.end("Not implemented");
      break;
  }
};