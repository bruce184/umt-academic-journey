const profileService = require('../services/profileService');

exports.getProfile = async (req, res) => {
    try {
        const user = await profileService.getProfileByUserId(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json({
            status: 'success',
            data: {
                user,
            },
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const updatedProfile = await profileService.updateProfileByUserId(
            req.user.id,
            req.user.username,
            req.body
        );

        res.json({
            status: 'success',
            data: {
                user: updatedProfile,
            },
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(error.statusCode || 500).json({ error: error.message || 'Failed to update profile' });
    }
};
