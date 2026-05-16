const achievementService = require('../services/achievementService');

const handleControllerError = (res, error, fallbackMessage) => {
    console.error(fallbackMessage, error);
    res.status(error.statusCode || 500).json({ error: error.message || fallbackMessage });
};

exports.getAchievements = async (req, res) => {
    try {
        const items = await achievementService.getAchievementCatalog();

        res.json({
            status: 'success',
            data: {
                items,
            },
        });
    } catch (error) {
        handleControllerError(res, error, 'Failed to fetch achievements');
    }
};

exports.getMyAchievements = async (req, res) => {
    try {
        const result = await achievementService.getAchievementsForUser(req.user.id);

        res.json({
            status: 'success',
            data: result,
        });
    } catch (error) {
        handleControllerError(res, error, 'Failed to fetch player achievements');
    }
};
