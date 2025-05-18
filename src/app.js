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

  // Adicione o session antes do lusca
  app.use(session({
    secret: process.env.SESSION_SECRET || 'sessao_segura',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    }
  }));

  // Agora pode usar lusca
  app.use(lusca.csrf());
  app.use(lusca.xframe('SAMEORIGIN'));
  app.use(lusca.xssProtection(true));

  app.use(morgan("dev"));

  // Endpoint para obter o token CSRF do cookie da sessão
  app.get('/api/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
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
