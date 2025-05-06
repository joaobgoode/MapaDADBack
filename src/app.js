const express = require('express');
require('dotenv').config();
require('./config/database');
const cors = require('cors');
const morgan = require('morgan');

module.exports = function (wss) {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  app.use('/api/user', require('./routes/user.routes'));
  app.use('/api/horarios', require('./routes/horario.routes')(wss));

  return app;
};
