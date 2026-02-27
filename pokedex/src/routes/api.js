const express = require('express');
const router = express.Router();
const pkmnController = require('../controllers/pkmn.controller');
const authM = require('../middlewares/auth.middleware');

// Route publique
router.get('/pkmn/search', pkmnController.searchPokemons);
router.get('/pkmn', pkmnController.getAllPokemons);
router.get('/pkmn/types', pkmnController.getTypes);

router.get("/test-admin", authM, authM.isAdmin, (req, res) => {
  return res.status(200).send("OK");
});

// Route pour créer un Pokémon
router.post('/pkmn', authM, pkmnController.createPokemon);
// Route pour supprimer un Pokémon (Admin)
router.delete('/pkmn', authM, authM.isAdmin, pkmnController.deletePokemon);
// Route pour modifier un Pokémon (Admin)
router.put('/pkmn', authM, authM.isAdmin, pkmnController.updatePokemon);
// Route pour ajouter une région à un Pokémon
router.post('/pkmn/region', authM, pkmnController.addRegionToPokemon);
// Route pour supprimer une région d'un Pokémon (Admin)
router.delete('/pkmn/region', authM, authM.isAdmin, pkmnController.removeRegionFromPokemon);

module.exports = router;




