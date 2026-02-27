const TrainerModel = require('../models/trainer.model');
const UserModel = require('../models/users.model');

class TrainerService {
    async getUsernameByUserId(userId) {
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new Error('Utilisateur non trouvé');
        }
        return user.username;
    }

    async createTrainer(userId, trainerData) {
        const username = await this.getUsernameByUserId(userId);
        
        const existingTrainer = await TrainerModel.findOne({ username });
        if (existingTrainer) {
            throw new Error('Cet utilisateur possède déjà un dresseur.');
        }

        const newTrainerData = {
            ...trainerData,
            username: username
        };

        return await TrainerModel.create(newTrainerData);
    }

    async getTrainer(userId) {
        const username = await this.getUsernameByUserId(userId);
        return await TrainerModel.findOne({ username })
            .populate('pkmnSeen')
            .populate('pkmnCatch');
    }

    async updateTrainer(userId, updateData) {
        const username = await this.getUsernameByUserId(userId);
        
        if (updateData.username) {
            delete updateData.username;
        }

        return await TrainerModel.findOneAndUpdate(
            { username },
            updateData,
            { new: true, runValidators: true }
        ).populate('pkmnSeen').populate('pkmnCatch');
    }

    async deleteTrainer(userId) {
        const username = await this.getUsernameByUserId(userId);
        return await TrainerModel.findOneAndDelete({ username });
    }

    async markPokemon(userId, pokemonId, isCaptured) {
        const username = await this.getUsernameByUserId(userId);
        
        const trainer = await TrainerModel.findOne({ username });
        if (!trainer) {
            throw new Error('Aucun dresseur trouvé pour cet utilisateur');
        }

        const PkmnModel = require('../models/pokemon.model');
        const pokemonExists = await PkmnModel.findById(pokemonId);
        if (!pokemonExists) {
            throw new Error('Pokémon non valide / inexistant');
        }

        trainer.pkmnSeen.pull(pokemonId);
        trainer.pkmnCatch.pull(pokemonId);

        if (String(isCaptured) === 'true') {
            trainer.pkmnCatch.push(pokemonId);
        } else {
            trainer.pkmnSeen.push(pokemonId);
        }

        return await trainer.save();
    }
}

module.exports = {
    trainerService: new TrainerService()
};
