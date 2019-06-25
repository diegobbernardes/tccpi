const path = require('path');
const nodemailer = require('nodemailer');
const hds = require('nodemailer-express-handlebars');

const { host, port, user, pass } = require('../config/mailer.json');

var transport = nodemailer.createTransport({
    host,
    port,
    auth: { user, pass }
  });

  transport.user('compile', hbs({
      viewEngine: 'handlebars',
      viewPath: path.resolve('./src/resources/mail'),
      extName: '.html',
  }));

  module.exports = transport;