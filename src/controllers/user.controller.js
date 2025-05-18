const User = require('../models/user.model');

module.exports = (wss) => {
  const notifyClients = (data) => {
    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(data));
      }
    });
  };

  const createUser = async (req, res) => {
    try {
      const { role } = req.body;

      const { role: userRole } = req.user;

      if (userRole !== 'superuser' && (role == 'superuser' || role == 'admin')) {
        return res.status(403).json({ error: 'Você não tem permissão para criar usuários com esse papel' });
      }

      const { nome, usuario, email, senha, telefone, bloqueado } = req.body;
      const user = new User({
        nome,
        usuario,
        email,
        senha,
        telefone,
        role,
        bloqueado,
      });
      await user.save();
      notifyClients({ type: 'userCreate', data: user });

      res.status(201).json(user);
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ error: 'Nome de usuário já está em uso.' });
      }
      res.status(400).json({ error: err.message });
    }
  };

  const getAllUsers = async (req, res) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
  };

  const getUserById = async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
      res.json(user);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

  const updateUser = async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(user);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

  const changePassword = async (req, res) => {
    try {
      const userId = req.user.id;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Senha antiga e nova senha são obrigatórias' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const isMatch = await user.comparePassword(oldPassword);
      if (!isMatch) {
        return res.status(401).json({ error: 'Senha antiga incorreta' });
      }

      user.senha = newPassword;
      user.firstLogin = false;
      await user.save();

      return res.status(200).json({ message: 'Senha alterada com sucesso', success: true });
    } catch (error) {
      console.error('Erro ao trocar senha:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  const blockUser = async (req, res) => {
    try {
      const id = req.params.id;
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      user.bloqueado = !user.bloqueado;
      await user.save();

      notifyClients({ type: 'userBlocked', data: { id: user.id } });

      return res.status(200).json(user);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

  const deleteUser = async (req, res) => {
    try {
      const id = req.params.id;
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      notifyClients({ type: 'userDelete', data: { id: user.id } });

      return res.status(200).json(user);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

  return {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    changePassword,
    blockUser,
    deleteUser,
  };
};

