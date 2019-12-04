'use strict';

exports.helloWorld = (request, response) => {
  response.status(200).send('Hello World!');
};

exports.imageResize = (request, response) => {
  const Url = require('url');
  const path = require('path');
  const requestJs = require('request');
  const sharp = require('sharp');

  const url = request.query.url;

  if (url) {
    const pathname = Url.parse(url).pathname;
    const extension = path.extname(pathname).toLocaleLowerCase();
    const name = request.query.name ? (request.query.name + extension) : path.basename(pathname);
    const download = Boolean(request.query.download) || false
    const fit = request.query.fit || 'inside'
    
    const headers = {};
    headers['Cache-Control'] = 'public, max-age=2592000';
    headers['Expires'] = new Date(Date.now() + 2592000000).toUTCString();

    if (download) {
      headers['content-disposition'] = `attachment; filename="${name}"`;
    } else {
      headers['content-disposition'] = `inline; filename="${name}"`;
    }

    requestJs.get({
      url,
      encoding: null
    }, (err, res, body) => {
      if (err) {
        console.error(err);
        response
          .status(500)
          .send(err.message);
      } else {
        headers['Content-Type'] = res.headers['content-type'];

        // If the file is Image
        // And has to be resized
        const width = request.query.width ? Number(request.query.width) : null;
        const height = request.query.height ? Number(request.query.height) : null;
        if ((height && width) && (extension === '.png' || extension === '.jpg' || extension === '.jpeg')) {
          const image = sharp(body);
          image.resize(width, height, { fit }).toBuffer().then((buffer) => {
            response
              .status(200)
              .set(headers)
              .send(buffer);
          })
          .catch(error => {
            console.error(error);
            response
              .status(500)
              .send(error.message);
          });
        } else {
          response
            .status(200)
            .set(headers)
            .send(body);
        }
      }
    })
  }
}

exports.qr = async (request, response) => {
  const qrcode = require('qrcode');

  const text = request.query.text;

  try {
    await qrcode.toFileStream(response, text);
  } catch (error) {
    console.error(error);
  }
};

exports.event = (event, callback) => {
  callback();
};
