const { trainerService } = require('../services/trainer.service');

const createTrainer = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const trainer = await trainerService.createTrainer(userId, req.body);
        
        res.status(201).json({
            data: trainer,
            message: 'Dresseur créé avec succès'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getTrainer = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const trainer = await trainerService.getTrainer(userId);
        
        if (!trainer) {
            return res.status(404).json({
                success: false,
                message: 'Aucun dresseur trouvé pour cet utilisateur'
            });
        }

        res.status(200).json({
            data: trainer
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du dresseur',
            error: error.message
        });
    }
};

const updateTrainer = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const updatedTrainer = await trainerService.updateTrainer(userId, req.body);
        
        if (!updatedTrainer) {
            return res.status(404).json({
                success: false,
                message: 'Aucun dresseur trouvé pour cet utilisateur'
            });
        }

        res.status(200).json({
            data: updatedTrainer,
            message: 'Dresseur modifié avec succès'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la modification du dresseur',
            error: error.message
        });
    }
};

const deleteTrainer = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const deletedTrainer = await trainerService.deleteTrainer(userId);
        
        if (!deletedTrainer) {
            return res.status(404).json({
                success: false,
                message: 'Aucun dresseur trouvé pour cet utilisateur'
            });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression du dresseur',
            error: error.message
        });
    }
};

const markPokemon = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { pokemonId, isCaptured } = req.body;

        if (!pokemonId || isCaptured === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Les champs pokemonId et isCaptured sont requis.'
            });
        }

        const updatedTrainer = await trainerService.markPokemon(userId, pokemonId, isCaptured);
        
        res.status(200).json({
            data: updatedTrainer,
            message: 'Le Pokémon a bien été marqué.'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createTrainer,
    getTrainer,
    updateTrainer,
    deleteTrainer,
    markPokemon
};
