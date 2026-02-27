const userService = require('../services/user.service');
const bcrypt = require('bcrypt');

// Créer un utilisateur
exports.createUser = async (req, res) => {
    let user;
    let userData = structuredClone(req.body);
    try {
        let hash = await bcrypt.hash(userData.password, 10);
        userData.password = hash;
        console.log('Body reçu:', userData);
        user = await userService.createUser(userData);
        res.status(201).send({ id: user._id });
    } catch (err) {
        console.log('Erreur:', err);
        res.status(400).send(err);
    }
};

// Récupérer un utilisateur par ID ou email
exports.getUserByIdOrEmail = async (req, res) => {
    try {
        const user = await userService.getUserByIdOrEmail(req.params.id_or_email);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        if (req.auth.userId !== user._id.toString()) {
            return res.status(403).send({ message: 'Vous n\'êtes pas autorisé à accéder à cet utilisateur' });
        }
        res.status(200).send(user);
    } catch (err) {
        res.status(500).send(err);
    }
};

// Mettre à jour un utilisateur
exports.updateUser = async (req, res) => {
    let user;
    let userData = structuredClone(req.body);
    try {
        if (req.auth.userId !== req.params.id) {
            return res.status(403).send({ message: 'Vous n\'êtes pas autorisé à accéder à cet utilisateur' });
        }
        let hash = await bcrypt.hash(userData.password, 10);
        userData.password = hash;
        const user = await userService.updateUserById(req.params.id, userData);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.status(200).send(user);
    } catch (err) {
        res.status(400).send(err);
    }
};

// Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
    try {
        const user = await userService.deleteUserById(req.params.id);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.status(200).send({ message: 'User deleted successfully', user });
    } catch (err) {
        res.status(500).send(err);
    }
};

// Récupérer tous les utilisateurs 
exports.getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).send(users);
    } catch (err) {
        res.status(500).send(err);
    }
};
