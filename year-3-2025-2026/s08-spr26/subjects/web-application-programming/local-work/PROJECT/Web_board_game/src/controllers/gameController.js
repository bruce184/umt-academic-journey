const db = require('../db/db');

exports.getAllGames = async (req, res) => {
    try {
        const games = await db('games').select('*');
        res.status(200).json(games);
    } catch (error) {
        console.error('getAllGames error:', error);
        res.status(500).json({ error: 'Failed to fetch games' });
    }
};

exports.getGameById = async (req, res) => {
    try {
        const game = await db('games').where('id', req.params.id).first();
        if (!game) return res.status(404).json({ error: 'Game not found' });
        res.status(200).json(game);
    } catch (error) {
        console.error('getGameById error:', error);
        res.status(500).json({ error: 'Failed to fetch game' });
    }
};

exports.saveGameProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        const gameId = req.params.id;
        const { state } = req.body; // updated from game_state per contract
        
        if (!state) {
            return res.status(400).json({ error: 'Missing game state' });
        }

        const upsertQuery = `
            INSERT INTO saved_games (user_id, game_id, game_state, updated_at)
            VALUES (?, ?, ?::json, NOW())
            ON CONFLICT (user_id, game_id)
            DO UPDATE SET game_state = EXCLUDED.game_state, updated_at = NOW()
            RETURNING *;
        `;
        
        const result = await db.raw(upsertQuery, [userId, gameId, JSON.stringify(state)]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('saveGameProgress error:', error);
        res.status(500).json({ error: 'Failed to save game progress' });
    }
};

exports.loadGameProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        const gameId = req.params.id;
        
        const progress = await db('saved_games')
            .where({ user_id: userId, game_id: gameId })
            .first();
            
        if (!progress) {
            return res.status(404).json({ message: 'No saved progress found' });
        }
        
        res.json({
            gameId,
            state: progress.game_state,
            savedAt: progress.updated_at
        });
    } catch (error) {
        console.error('loadGameProgress error:', error);
        res.status(500).json({ error: 'Failed to load game progress' });
    }
};

exports.deleteGameProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        const gameId = req.params.id;
        
        await db('saved_games')
            .where({ user_id: userId, game_id: gameId })
            .del();
            
        res.json({ message: 'Saved progress deleted successfully' });
    } catch (error) {
        console.error('deleteGameProgress error:', error);
        res.status(500).json({ error: 'Failed to delete game progress' });
    }
};

exports.submitSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const gameId = req.params.id;
        const { score, duration } = req.body;

        const [session] = await db('game_sessions').insert({
            game_id: gameId,
            user_id: userId,
            score: score || 0,
            duration: duration || 0
        }).returning('*');

        res.status(201).json(session);
    } catch (error) {
        console.error('submitSession error:', error);
        res.status(500).json({ error: 'Failed to submit session' });
    }
};
