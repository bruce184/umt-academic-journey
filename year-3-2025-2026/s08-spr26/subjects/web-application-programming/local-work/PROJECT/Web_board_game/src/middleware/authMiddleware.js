const jwt = require('jsonwebtoken');
const db = require('../db/db');

exports.protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ error: 'You are not logged in. Please log in to get access.' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user still exists
        const user = await db('users').where({ id: decoded.id }).first();
        if (!user) {
            return res.status(401).json({ error: 'The user belonging to this token no longer exists.' });
        }

        if (user.is_active === false) {
            return res.status(403).json({ error: 'This account has been disabled.' });
        }

        // Grant access to protected route
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ error: 'Invalid token or session expired.' });
    }
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'You do not have permission to perform this action' });
        }
        next();
    };
};
