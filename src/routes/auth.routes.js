const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

router.post('/', async (req, res) => {
  try {
    const { usuario, senha } = req.body;
    console.log("dados recebidos:", req.body);

    if (!usuario || !senha) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    const user = await User.findOne({ usuario: usuario });

    if (!user) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    if (user.bloqueado) {
      return res.status(403).json({ error: 'Conta bloqueada. Entre em contato com o administrador.' });
    }

    const isMatch = await user.comparePassword(senha);

    if (!isMatch) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    const token = jwt.sign(
      {
        id: user._id,
        usuario: user.usuario,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        nome: user.nome,
        usuario: user.usuario,
        email: user.email,
        role: user.role,
        firstLogin: user.firstLogin
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
