const mongoose = require('mongoose');

const espacoSchema = new mongoose.Schema({
  nome: String,
});

const Espaco = mongoose.model('Espaco', espacoSchema);
module.exports = Espaco;

