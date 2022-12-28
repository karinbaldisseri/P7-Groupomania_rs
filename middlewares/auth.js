const jwt = require('jsonwebtoken');
require('dotenv').config();

// AUTHORIZE 
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_TOKEN); 
        const userId = decodedToken.userId;
        const isAdmin = decodedToken.isAdmin;
        req.auth = { userId, isAdmin };
        next();
    } catch(error) {
        res.status(500).json({ error /*: 'Auth error'*/ });  
    }
};