const express = require('express');
require('dotenv').config();
require('./config/database');
const cors = require('cors');

module.exports = function (wss) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api/user', require('./routes/user.routes'));
  app.use('/api/horarios', require('./routes/horario.routes')(wss));

  return app;
};
