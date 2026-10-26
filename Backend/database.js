const mysql = require('mysql2');
const fs = require('node:fs');
const path = require('node:path');

module.exports = function createDatabase() {
    return mysql.createPool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        connectionLimit: 5,
        ssl: {
            ca: fs.readFileSync(process.env.DB_CA_PATH || path.join(__dirname, 'certs', 'ca.pem')),
            rejectUnauthorized: true
        }
    });
};
