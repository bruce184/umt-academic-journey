const express = require('express');
const cors = require('cors');
const app = express();

const normalizeOrigin = (value) => String(value || '').replace(/\/+$/, '');

const buildAllowedOrigins = () => {
    const origins = new Set();

    if (process.env.APP_ORIGIN) {
        origins.add(normalizeOrigin(process.env.APP_ORIGIN));
    }

    if (process.env.NODE_ENV !== 'production') {
        [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5174',
        ].forEach((origin) => origins.add(normalizeOrigin(origin)));
    }

    return origins;
};

const allowedOrigins = buildAllowedOrigins();

app.use(
    cors({
        origin(origin, callback) {
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.has(normalizeOrigin(origin))) {
                return callback(null, true);
            }

            return callback(new Error(`CORS blocked for origin: ${origin}`));
        },
        credentials: true,
    })
);
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const userSearchRoutes = require('./routes/userSearchRoutes');
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const rankingRoutes = require('./routes/rankingRoutes');
const gameRoutes = require('./routes/gameRoutes');
const friendRoutes = require('./routes/friendRoutes');
const messageRoutes = require('./routes/messageRoutes');
const achievementRoutes = require('./routes/achievementRoutes');

const adminRoutes = require('./routes/adminRoutes');
const apiDocsRoutes = require('./routes/apiDocsRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', userSearchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/games', reviewRoutes);
app.use('/api/rankings', rankingRoutes);
app.use('/api-docs', apiDocsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
    res.send('Welcome to the Board Game Project API');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
