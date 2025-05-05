const express = require('express');
const app = express();
require('dotenv').config();
require('./config/database');
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use('/api/user', require('./routes/user.routes'));
app.use('/api/horarios', require('./routes/horario.routes'));

module.exports = app;
