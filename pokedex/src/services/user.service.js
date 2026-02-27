const userModel = require('../models/users.model');

class UserService {
    
    // Créer un nouvel utilisateur
    async createUser(userData) {
        return await userModel.create(userData);
    }
    
    // Récupérer un utilisateur par ID
    async getUserById(id) {
        return await userModel.findById(id);
    }
    
    // Récupérer un utilisateur par email
    async getUserByEmail(email) {
        return await userModel.findOne({ email: email });
    }
    
    // Récupérer un utilisateur par ID ou email
    async getUserByIdOrEmail(idOrEmail) {
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(idOrEmail);
        
        if (isValidObjectId) {
            return await this.getUserById(idOrEmail);
        } else {
            return await this.getUserByEmail(idOrEmail);
        }
    }
    
    // Mettre à jour un utilisateur par ID
    async updateUserById(id, userData) {
        return await userModel.findByIdAndUpdate(
            id, 
            userData, 
            { new: true, runValidators: true }
        );
    }
    
    // Supprimer un utilisateur par ID
    async deleteUserById(id) {
        return await userModel.findByIdAndDelete(id);
    }
    
    // Récupérer tous les utilisateurs
    async getAllUsers() {
        return await userModel.find();
    }
}

module.exports = new UserService();