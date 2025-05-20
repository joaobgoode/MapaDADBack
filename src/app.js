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
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
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

  app.use(lusca.csrf());
  app.use(lusca.xframe('SAMEORIGIN'));
  app.use(lusca.xssProtection(true));

  app.use(morgan("dev"));

  app.use((req, res, next) => {
    console.log('Sessão ID:', req.sessionID);
    console.log('Token CSRF recebido:', req.headers['x-csrf-token']);
    next();
  });

  app.get('/api/csrf-token', (req, res) => {
    if (!req.session) {
      return res.status(500).json({ error: 'Sessão não iniciada' });
    }

    try {
      const csrfToken = req.csrfToken();
      res.json({ csrfToken });
    } catch (err) {
      console.error('Erro ao gerar token CSRF:', err);
      res.status(500).json({ error: 'Erro ao gerar token CSRF' });
    }
  });

  app.use('/login', require('./routes/auth.routes'));
  app.use('/api/users', require('./routes/user.routes')(wss));
  app.use('/api/spaces', require('./routes/spaces.routes')(wss));
  app.use('/api/horarios', require('./routes/horario.routes')(wss));

  app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
      return res.status(403).json({
        message: 'Formulário expirado ou inválido. Por favor, tente novamente.'
      });
    }
    next(err);
  });

  return app;
};
