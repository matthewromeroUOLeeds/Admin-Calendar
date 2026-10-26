require('dotenv').config();
const bcrypt = require('bcryptjs');
const createDatabase = require('../database');

async function main() {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
        !password || password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) {
        throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (12 characters minimum, 72 UTF-8 bytes maximum) in Backend/.env');
    }
    const db = createDatabase().promise();
    try {
        await db.query(`CREATE TABLE IF NOT EXISTS AdminUsers (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(254) NOT NULL UNIQUE,
            password_hash VARCHAR(60) NOT NULL
        )`);
        const hash = await bcrypt.hash(password, 12);
        // Never silently overwrite an existing administrator or password.
        await db.query('INSERT INTO AdminUsers (email, password_hash) VALUES (?, ?)', [email, hash]);
        console.log('Admin account created. Remove ADMIN_PASSWORD from your .env now.');
    } finally {
        await db.end();
    }
}
main().catch(err => { console.error('Admin setup failed:', err.code || err.message); process.exitCode = 1; });
