const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authM = require('../middlewares/auth.middleware');

router.post('/', userController.createUser);
router.put('/:id', authM, userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.get('/:id_or_email', authM, userController.getUserByIdOrEmail);
router.get('/', userController.getAllUsers);

module.exports = router;
