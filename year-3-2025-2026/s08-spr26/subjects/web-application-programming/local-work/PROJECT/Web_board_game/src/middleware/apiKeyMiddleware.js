const requireApiKey = (req, res, next) => {
    const expectedApiKey = process.env.API_KEY;

    if (!expectedApiKey) {
        return res.status(500).json({ error: 'API key protection is not configured on the server.' });
    }

    if (req.headers['x-api-key'] !== expectedApiKey) {
        return res.status(401).json({ error: 'A valid x-api-key header is required.' });
    }

    return next();
};

module.exports = {
    requireApiKey,
};
