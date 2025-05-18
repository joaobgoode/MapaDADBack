
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const checkAdminOrSuperuserJwt = require('../middleware/credentialMiddleware');

module.exports = (wss) => {
  const router = express.Router();

  const userController = require('../controllers/user.controller')(wss);

  router.use(authMiddleware);

  router.post('/change-password', userController.changePassword);

  router.post('/', checkAdminOrSuperuserJwt, userController.createUser);
  router.put('/block/:id', checkAdminOrSuperuserJwt, userController.blockUser);
  router.get('/', checkAdminOrSuperuserJwt, userController.getAllUsers);
  router.get('/:id', checkAdminOrSuperuserJwt, userController.getUserById);
  router.put('/update/:id', checkAdminOrSuperuserJwt, userController.updateUser);
  router.delete('/:id', checkAdminOrSuperuserJwt, userController.deleteUser);

  return router;
};

