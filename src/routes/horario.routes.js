const express = require('express');
const router = express.Router();
const horarioController = require('../controllers/horario.controller');

router.get('/', horarioController.getHorariosBySpace);
router.put('/color', horarioController.changeColor);
router.put('/', horarioController.bulkUpsertHorarios);

module.exports = router;
