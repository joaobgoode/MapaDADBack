const Horario = require('../models/horario.model');

exports.createHorario = async (data) => {
  const horario = new Horario(data);
  return await horario.save();
};

exports.getAllHorarios = async () => {
  return await Horario.find();
};

exports.getHorarioById = async (id) => {
  return await Horario.findById(id);
};

exports.updateHorario = async (id, data) => {
  return await Horario.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteHorario = async (id) => {
  return await Horario.findByIdAndDelete(id);
};
