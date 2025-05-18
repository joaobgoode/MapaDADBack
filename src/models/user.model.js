const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  usuario: { type: String, required: true, unique: true },
  email: { type: String, match: /.+\@.+\..+/ },
  senha: { type: String, required: true },
  telefone: { type: String },
  role: { type: String, enum: ['superuser', 'admin', 'funcionario', 'user'], required: true, default: 'user' },
  bloqueado: { type: Boolean, default: false },
  firstLogin: { type: Boolean, default: true },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('senha')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.senha);
  } catch (error) {
    throw new Error(error);
  }
};

const User = mongoose.model('User', userSchema);
module.exports = User;
