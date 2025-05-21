const express = require('express');
require('dotenv').config();
require('./config/database');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const lusca = require('lusca');

module.exports = function (wss) {
  const app = express();

  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser(process.env.COOKIE_SECRET || 'sua_chave_secreta'));

  app.use(session({
    secret: process.env.SESSION_SECRET || 'sessao_segura',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    }
  }));

  app.use(lusca.xframe('SAMEORIGIN'));
  app.use(lusca.xssProtection(true));
  app.use(morgan("dev"));

  app.use((req, res, next) => {
    console.log('Sessão ID:', req.sessionID);
    next();
  });


  app.use('/login', require('./routes/auth.routes'));
  app.use('/api/users', require('./routes/user.routes')(wss));
  app.use('/api/spaces', require('./routes/spaces.routes')(wss));
  app.use('/api/horarios', require('./routes/horario.routes')(wss));


  return app;
};
