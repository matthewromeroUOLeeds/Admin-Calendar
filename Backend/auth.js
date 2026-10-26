const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bcrypt = require('bcryptjs');
const { rateLimit } = require('express-rate-limit');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const sessionCall = (req, method) => new Promise((resolve, reject) => {
    req.session[method](err => err ? reject(err) : resolve());
});

function installAuth(app, db, { store, secret = process.env.SESSION_SECRET,
    frontendUrl = process.env.FRONTEND_URL, production = process.env.NODE_ENV === 'production' } = {}) {
    if (!secret || secret.length < 32) throw new Error('SESSION_SECRET must contain at least 32 characters');
    if (!frontendUrl) throw new Error('FRONTEND_URL must be the exact frontend origin');
    const origin = new URL(frontendUrl).origin;
    const cookieName = production ? '__Host-admin_session' : 'admin_session';
    const cookieOptions = { httpOnly: true, secure: production, sameSite: production ? 'none' : 'lax', path: '/' };
    app.set('trust proxy', 1);
    app.use((req, res, next) => {
        res.set('Cache-Control', 'no-store');
        res.set('X-Content-Type-Options', 'nosniff');
        // Enforce CSRF protection independently of CORS, including login and logout.
        if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
            (req.get('Origin') !== origin || req.get('X-Requested-With') !== 'AdminCalendar')) {
            return res.status(403).json({ error: 'Request origin not allowed' });
        }
        next();
    });
    app.use(session({
        name: cookieName,
        secret,
        store: store || new MySQLStore({ createDatabaseTable: true }, db),
        resave: false,
        saveUninitialized: false,
        cookie: { ...cookieOptions, maxAge: 8 * 60 * 60 * 1000 }
    }));
    const router = express.Router();
    const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10,
        standardHeaders: 'draft-7', legacyHeaders: false,
        message: { error: 'Too many login attempts. Try again in 15 minutes.' } });
    router.post('/login', loginLimiter, asyncHandler(async (req, res) => {
        const { email, password } = req.body || {};
        if (typeof email !== 'string' || typeof password !== 'string' ||
            email.length > 254 || Buffer.byteLength(password, 'utf8') > 72 || !password) {
            return res.status(400).json({ error: 'Enter a valid email and password' });
        }
        const [rows] = await db.promise().query(
            'SELECT id, email, password_hash FROM AdminUsers WHERE email = ? LIMIT 1',
            [email.trim().toLowerCase()]);
        const admin = rows[0];
        // Compare a fixed dummy hash too, to avoid an obvious unknown-email timing difference.
        const hash = admin ? admin.password_hash : '$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW';
        const valid = await bcrypt.compare(password, hash);
        if (!admin || !valid) return res.status(401).json({ error: 'Incorrect email or password' });
        await sessionCall(req, 'regenerate');
        req.session.admin = { id: admin.id, email: admin.email };
        await sessionCall(req, 'save');
        res.json({ admin: req.session.admin });
    }));
    router.get('/session', (req, res) => {
        if (!req.session.admin) return res.status(401).json({ error: 'Login required' });
        res.json({ admin: req.session.admin });
    });
    router.post('/logout', asyncHandler(async (req, res) => {
        await sessionCall(req, 'destroy');
        res.clearCookie(cookieName, cookieOptions);
        res.sendStatus(204);
    }));
    app.use('/auth', router);
    // Registered before EVERY calendar route; direct API calls need authentication too.
    app.use((req, res, next) => {
        if (!req.session.admin) return res.status(401).json({ error: 'Login required' });
        next();
    });
}

module.exports = { installAuth };
