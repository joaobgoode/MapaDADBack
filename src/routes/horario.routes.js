const express = require('express');

module.exports = (wss) => {
  const router = express.Router();
  const horarioController = require('../controllers/horario.controller')(wss);

  router.get('/', horarioController.getHorariosBySpace);
  router.put('/color', horarioController.changeColor);
  router.put('/', horarioController.bulkUpsertHorarios);

  return router;
};
