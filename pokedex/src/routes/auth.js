const express =require('express');
const router = express.Router();
const authController =require('../controllers/auth.controller');
const authM = require('../middlewares/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/checkUser', authM, authController.checkUser);

module.exports =router;