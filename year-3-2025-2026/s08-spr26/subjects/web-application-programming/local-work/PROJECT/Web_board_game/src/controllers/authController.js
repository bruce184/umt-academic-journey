const db = require('../db/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const getAppOrigin = () => (process.env.APP_ORIGIN || 'http://localhost:5173').replace(/\/+$/, '');

const buildVerificationLink = (path, token) =>
    `${getAppOrigin()}${path}/${encodeURIComponent(token)}`;

const normalizeToken = (token) => (typeof token === 'string' ? token.trim() : '');

const signToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '1d'
    });
};

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Please provide username, email, and password' });
        }

        if (username.length < 3) {
            return res.status(400).json({ error: 'Username must be at least 3 characters long' });
        }

        if (password.length < 3) {
            return res.status(400).json({ error: 'Password must be at least 3 characters long' });
        }

        if (!email.includes('@')) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Check username conflict
        const existingUsername = await db('users').where({ username }).first();
        if (existingUsername) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Check email conflict
        const existingEmail = await db('users').where({ email }).first();
        if (existingEmail) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Hash password and store it inside a short-lived verification token
        const hashedPassword = await bcrypt.hash(password, 12);

        const registerToken = jwt.sign(
            { username, email, password_hash: hashedPassword },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        const verificationLink = buildVerificationLink('/verify-register', registerToken);
        const message = `Please click the following link to verify and create your account:\n\n${verificationLink}\n\nIf you didn't request this, please ignore this email.`;
        const html = `
            <p>Please click the button below to verify and create your account:</p>
            <p><a href="${verificationLink}" target="_blank" rel="noopener noreferrer">Verify registration</a></p>
            <p>If the button does not work, copy and paste this link into your browser:</p>
            <p>${verificationLink}</p>
            <p>If you didn't request this, please ignore this email.</p>
        `;

        try {
            const sendEmail = require('../utils/sendEmail');

            await sendEmail({
                email,
                subject: 'Account Registration Verification',
                message,
                html,
            });

            return res.status(200).json({
                status: 'success',
                message: 'Verification email sent. It expires in 15 minutes.'
            });
        } catch (err) {
            console.error('Email sending error:', err);
            return res.status(500).json({
                error: 'Failed to send verification email. Ensure EMAIL_USER and EMAIL_PASS are correct.'
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'Failed to register user' });
    }
};

exports.verifyRegister = async (req, res) => {
    try {
        const token = normalizeToken(req.body?.token);

        if (!token) {
            return res.status(400).json({ error: 'Verification token is required' });
        }

        // Decode verification token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check separately to distinguish:
        // 1) same user already created before
        // 2) real conflict with another account
        const existingByEmail = await db('users')
            .where({ email: decoded.email })
            .first();

        const existingByUsername = await db('users')
            .where({ username: decoded.username })
            .first();

        // If both email and username already point to the same user,
        // treat this as already verified (idempotent behavior).
        if (
            existingByEmail &&
            existingByUsername &&
            existingByEmail.id === existingByUsername.id
        ) {
            return res.status(200).json({
                status: 'success',
                message: 'Account already verified',
                username: existingByEmail.username
            });
        }

        // If only one exists or they belong to different users,
        // this is a real conflict.
        if (existingByEmail || existingByUsername) {
            return res.status(409).json({
                error: 'Email or username is already used by another account'
            });
        }

        // Create user + profile in one transaction
        let createdUser;

        try {
            createdUser = await db.transaction(async (trx) => {
                const insertedUsers = await trx('users')
                    .insert({
                        username: decoded.username,
                        email: decoded.email,
                        password_hash: decoded.password_hash,
                        role: 'user'
                    })
                    .returning(['id', 'username', 'email', 'role']);

                const newUser = insertedUsers[0];

                await trx('profiles')
                    .insert({
                        user_id: newUser.id,
                        display_name: newUser.username
                    })
                    .onConflict('user_id')
                    .ignore();

                return newUser;
            });
        } catch (error) {
            if (error.code !== '23505') {
                throw error;
            }

            const existingUser = await db('users')
                .where({ email: decoded.email, username: decoded.username })
                .first();

            if (!existingUser) {
                return res.status(409).json({
                    error: 'Email or username is already used by another account'
                });
            }

            await db('profiles')
                .insert({
                    user_id: existingUser.id,
                    display_name: existingUser.username
                })
                .onConflict('user_id')
                .ignore();

            return res.status(200).json({
                status: 'success',
                message: 'Account already verified',
                username: existingUser.username
            });
        }

        return res.status(201).json({
            status: 'success',
            message: 'Account successfully created',
            username: createdUser.username
        });
    } catch (error) {
        console.error('Verify register error:', error);

        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({
                error: 'Verification link expired. Please register again.'
            });
        }

        return res.status(400).json({
            error: 'Invalid or missing verification token'
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide email and password' });
        }

        const user = await db('users').where({ email }).first();

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: 'Incorrect email or password' });
        }

        if (user.is_active === false) {
            return res.status(403).json({ error: 'This account has been disabled.' });
        }

        const token = signToken(user.id, user.role);

        delete user.password_hash;

        return res.status(200).json({
            status: 'success',
            token,
            data: { user }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Failed to login' });
    }
};

exports.requestPasswordReset = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ error: 'Please provide email and new password' });
        }

        if (newPassword.length < 3) {
            return res.status(400).json({ error: 'Password must be at least 3 characters long' });
        }

        if (!email.includes('@')) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const user = await db('users').where({ email }).first();

        if (!user) {
            return res.status(404).json({ error: 'User does not exist' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        const resetToken = jwt.sign(
            { id: user.id, newPasswordHash: hashedPassword },
            process.env.JWT_SECRET,
            { expiresIn: '10m' }
        );

        const verificationLink = buildVerificationLink('/verify-reset', resetToken);
        const message = `Please click the following link to verify your password reset:\n\n${verificationLink}\n\nIf you didn't request this, please ignore this email.`;
        const html = `
            <p>Please click the button below to verify your password reset:</p>
            <p><a href="${verificationLink}" target="_blank" rel="noopener noreferrer">Verify password reset</a></p>
            <p>If the button does not work, copy and paste this link into your browser:</p>
            <p>${verificationLink}</p>
            <p>If you didn't request this, please ignore this email.</p>
        `;

        try {
            const sendEmail = require('../utils/sendEmail');

            await sendEmail({
                email: user.email,
                subject: 'Password Reset Verification',
                message,
                html,
            });

            return res.status(200).json({
                status: 'success',
                message: 'Verification email sent. It expires in 10 minutes.'
            });
        } catch (err) {
            console.error('Email sending error:', err);
            return res.status(500).json({
                error: 'There was an error sending the email. Ensure EMAIL_USER and EMAIL_PASS are correct.'
            });
        }
    } catch (error) {
        console.error('Request reset error:', error);
        return res.status(500).json({ error: 'Failed to request password reset' });
    }
};

exports.verifyPasswordReset = async (req, res) => {
    try {
        const token = normalizeToken(req.body?.token);

        if (!token) {
            return res.status(400).json({ error: 'Verification token is required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await db('users').where({ id: decoded.id }).first();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await db('users')
            .where({ id: decoded.id })
            .update({
                password_hash: decoded.newPasswordHash
            });

        return res.status(200).json({
            status: 'success',
            message: 'Password successfully reset',
            username: user.username
        });
    } catch (error) {
        console.error('Verify reset error:', error);

        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({
                error: 'Verification link expired. Please request a new one.'
            });
        }

        return res.status(400).json({
            error: 'Invalid or missing verification token'
        });
    }
};
