const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  nome: String,
  email: String,
  senha: String
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('senha')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, salt);
    next();
  } catch (err) {
    return next(err);
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;

