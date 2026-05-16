const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');
const { getPaginationParams } = require('../middleware/paginationMiddleware');
const jwt = require('jsonwebtoken');

// A soft protect middleware to inject req.user if token is present, else continue
const softProtect = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        } catch (e) {
            // just ignore error if invalid for soft protect
        }
    }
    next();
};

router.get('/', softProtect, getPaginationParams, rankingController.getGameRankings);

module.exports = router;
