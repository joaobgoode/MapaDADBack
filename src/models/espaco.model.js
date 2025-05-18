const mongoose = require('mongoose');

const espacoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  active: { type: Boolean, default: true },
});

const Espaco = mongoose.model('Espaco', espacoSchema);
module.exports = Espaco;

