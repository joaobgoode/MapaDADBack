const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

module.exports = (wss) => {
  const router = express.Router();
  const espacoController = require('../controllers/espaco.controller.js')(wss);

  router.use(authMiddleware);

  router.post('/', espacoController.createEspaco);
  router.get('/', espacoController.getEspacos);
  router.get('/active', espacoController.getEspacosAtivos);
  router.put('/toggle', espacoController.toggleEspaco);
  router.delete('/:name', espacoController.deleteEspaco);
  router.put("/rename", espacoController.changeEspaco);


  return router;
};

