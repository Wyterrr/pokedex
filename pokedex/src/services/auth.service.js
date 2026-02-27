const userModel = require('../models/users.model');
const bcrypt = require('bcrypt');

class AuthService {
    
    // Créer un nouvel utilisateur
    async register(userData) {
        const newUser = await userModel.create(userData);
        
        // Création automatique du Dresseur lié à l'utilisateur
        const TrainerModel = require('../models/trainer.model');
        await TrainerModel.create({
            username: newUser.username,
            trainerName: newUser.username, // Par défaut on lui donne son username
            pkmnSeen: [],
            pkmnCatch: []
        });

        return newUser;
    }

    // Récupérer un utilisateur par email
    async getUserByEmail(email) {
        return await userModel.findOne({ email: email });
    }

    // Récupérer un utilisateur par username
    async getUserByUsername(username) {
        return await userModel.findOne({ username: username });
    }

    //Validation du mot de passe
    async validatePassword(inputPassword, storedHash) {
        return await bcrypt.compare(inputPassword, storedHash);
    }
}

module.exports = new AuthService();