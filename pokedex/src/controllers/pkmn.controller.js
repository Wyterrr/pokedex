const { pkmnService } = require('../services/pkmn.service');

const getTypes = (req, res) => {
    try {
        const types = pkmnService.getTypes();
        res.status(200).json({
            data: types,
            count: types.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des types',
            error: error.message
        });
    }
};

const searchPokemons = async (req, res) => {
    try {
        const { data, count } = await pkmnService.searchPokemons(req.query);
        res.status(200).json({
            data,
            count
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la recherche des Pokémons',
            error: error.message
        });
    }
};

const getAllPokemons = async (req, res) => {
    try {
        const { id, name } = req.query;

        // Si id ou name est fourni, on cherche un seul Pokémon
        if (id || name) {
            const pokemon = await pkmnService.getPokemon(id, name);
            if (!pokemon) {
                return res.status(404).json({
                    success: false,
                    message: 'Pokémon non trouvé'
                });
            }
            return res.status(200).json({
                data: pokemon
            });
        }

        // Sinon, on retourne tout
        const pokemons = await pkmnService.getAllPokemons();
        res.status(200).json({
            data: pokemons,
            count: pokemons.length,
            success: true
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des Pokémons',
            error: error.message
        });
    }
};

const createPokemon = async (req, res) => {
    try {
        const pokemon = await pkmnService.createPokemon(req.body);
        res.status(201).json({
            data: pokemon,
            message: 'Pokémon créé avec succès'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du Pokémon',
            error: error.message
        });
    }
};

const deletePokemon = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'L\'id du Pokémon est requis'
            });
        }

        const deletedPokemon = await pkmnService.deletePokemon(id);
        if (!deletedPokemon) {
            return res.status(404).json({
                success: false,
                message: 'Pokémon non trouvé'
            });
        }

        res.status(200).json({ message: 'Pokemon deleted successfully' });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression du Pokémon',
            error: error.message
        });
    }
};

const updatePokemon = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'L\'id du Pokémon est requis'
            });
        }

        const updatedPokemon = await pkmnService.updatePokemon(id, req.body);
        if (!updatedPokemon) {
            return res.status(404).json({
                success: false,
                message: 'Pokémon non trouvé'
            });
        }

        res.status(200).json({
            data: updatedPokemon,
            message: 'Pokémon modifié avec succès'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la modification du Pokémon',
            error: error.message
        });
    }
};

const addRegionToPokemon = async (req, res) => {
    try {
        const { pokemonId, regionName, regionPokedexNumber } = req.body;
        
        // Validation des données
        if (!pokemonId || !regionName || !regionPokedexNumber) {
            return res.status(400).json({
                success: false,
                message: 'pokemonId, regionName et regionPokedexNumber sont requis'
            });
        }

        const pokemon = await pkmnService.addRegionToPokemon(
            pokemonId, 
            regionName, 
            parseInt(regionPokedexNumber)
        );
        
        res.status(200).json({
            data: pokemon,
            message: 'Région ajoutée/mise à jour avec succès'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'ajout de la région',
            error: error.message
        });
    }
};

const removeRegionFromPokemon = async (req, res) => {
    try {
        const pkmnId = req.query.pkmnId || req.body.pkmnId || req.query.pkmnID || req.body.pkmnID;
        const regionName = req.query.regionName || req.body.regionName;

        // Validation des données
        if (!pkmnId || !regionName) {
            return res.status(400).json({
                success: false,
                message: 'Les paramètres pkmnId et regionName sont requis.'
            });
        }

        const pokemon = await pkmnService.removeRegionFromPokemon(pkmnId, regionName);
        if (!pokemon) {
            return res.status(404).json({
                success: false,
                message: 'Pokémon non trouvé.'
            });
        }

        res.status(200).json({ message: 'Région supprimée avec succès' });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de la région',
            error: error.message
        });
    }
};

module.exports = {
    getTypes,
    getAllPokemons,
    searchPokemons,
    createPokemon,
    deletePokemon,
    updatePokemon,
    addRegionToPokemon,
    removeRegionFromPokemon
};
