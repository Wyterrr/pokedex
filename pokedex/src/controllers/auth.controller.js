const authService = require('../services/auth.service');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    let user;
    let userData = structuredClone(req.body);
    try {
        delete userData.role;
        
        let hash = await bcrypt.hash(userData.password, 10);
        userData.password = hash;
        console.log('Body reçu:', userData);
        user = await authService.register(userData);
        res.status(201).json({ message: 'Utilisateur créé avec succès' });
    } catch (err) {
        console.log('Erreur:', err);
        res.status(400).send(err);
    }
};

exports.login = async (req, res) => {
    try {
        let user;
        const identifier = req.body.email || req.body.username;
        
        if (!identifier) {
            return res.status(400).json({ message: 'Email ou username requis' });
        }

        if (identifier.includes('@')) {
            user = await authService.getUserByEmail(identifier);
        } else {
            user = await authService.getUserByUsername(identifier);
        }
        
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        
        const isPasswordValid = await authService.validatePassword(req.body.password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Mot de passe incorrect' });
        }
        
        const token = jwt.sign(
            { userId: user._id, role: user.role }, 
            process.env.TOKEN_SECRET, 
            { expiresIn: '24h' }
        );
        res.status(200).json({ 
            message: 'Connexion réussie',
            userId: user._id,
            username: user.username,
            role: user.role,
            token: token,
            expiresIn: '24h'
        });
    } catch (err) {
        console.log('Erreur:', err);
        res.status(500).send(err);
    }
};

exports.checkUser = async (req, res) => {
    res.status(204).send();
};
