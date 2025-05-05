const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const horarioSchema = new Schema({
  space: { type: String, required: true },
  client: { type: String, default: '' },
  hour: { type: Number, required: true },
  date: { type: Date, required: true },
  color: { type: String }
});


const Horario = mongoose.model('Horario', horarioSchema);
module.exports = Horario;

