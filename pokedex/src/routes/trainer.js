const express = require('express');
const router = express.Router();
const trainerController = require('../controllers/trainer.controller');
const authM = require('../middlewares/auth.middleware');

router.use(authM);

router.post('/', trainerController.createTrainer);
router.get('/', trainerController.getTrainer);
router.put('/', trainerController.updateTrainer);
router.delete('/', trainerController.deleteTrainer);

router.post('/mark', trainerController.markPokemon);

module.exports = router;
