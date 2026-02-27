const jwt = require('jsonwebtoken');

// Middleware pour vérifier l'authentification
const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        const userId = decodedToken.userId;
        const role = decodedToken.role;
        req.auth = {
            userId: userId,
            role: role
        };
        next();
    } catch (error) {
        res.status(401).json({ error });
    }
};

// Middleware pour vérifier que l'utilisateur est admin
const isAdmin = (req, res, next) => {
    if (req.auth && req.auth.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Accès refusé. Droits administrateur requis.' });
    }
};

module.exports = authMiddleware;
module.exports.isAdmin = isAdmin;
