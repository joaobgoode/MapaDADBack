const Horario = require('../models/horario.model.js');

const changeColor = async (req, res) => {
  try {
    const { space, date, hour, color } = req.body;
    const options = {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
    const result = await Horario.findOneAndUpdate(
      { space: space, date: date, hour: hour },
      { color: color },
      options
    )
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erro ao atualizar a cor do horário:', error);
    return res.status(500).json({ error: 'Erro ao atualizar a cor do horário' });
  }
}

const getHorariosBySpace = async (req, res) => {
  try {
    const { space, date } = req.query;
    const horarios = await Horario.find({ space, date });

    return res.status(200).json(horarios);
  } catch (error) {
    console.error('Erro ao buscar horários:', error);
    return res.status(500).json({ error: 'Erro ao buscar horários' });
  }
};


const bulkUpsertHorarios = async (req, res) => {
  try {
    const horarios = req.body;

    if (!Array.isArray(horarios)) {
      return res.status(400).json({
        error: 'O formato esperado é um array de horários'
      });
    }

    if (horarios.length === 0) {
      return res.status(400).json({
        error: 'O array de horários não pode estar vazio'
      });
    }

    const bulkOps = horarios.map(horario => {
      const filter = {
        space: horario.space,
        date: horario.date,
        hour: horario.hour
      };

      return {
        updateOne: {
          filter: filter,
          update: { $set: horario },
          upsert: true
        }
      };
    });

    const result = await Horario.bulkWrite(bulkOps);

    return res.status(200).json({
      message: 'Horários atualizados com sucesso',
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
      upsertedIds: result.upsertedIds
    });

  } catch (error) {
    console.error('Erro ao fazer bulk upsert de horários:', error);
    return res.status(500).json({
      error: 'Erro ao atualizar horários',
      details: error.message
    });
  }
};

module.exports = {
  getHorariosBySpace,
  bulkUpsertHorarios,
  changeColor,
};
