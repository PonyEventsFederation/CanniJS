const mysql = require('mysql');
const stage = (process.env.STAGE || process.env.NODE_ENV || 'dev').toLowerCase();
if (stage == 'dev') require('dotenv').config();

function clearAllTimeouts() {
    const connection = mysql.createConnection({
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASS,
        database: process.env.DATABASE_NAME,
        charset: 'utf8mb4',
    });

    connection.connect();
    connection.query('DELETE FROM timeout');
    connection.end();

    console.log('Deleted all timeouts for CanniJS');
}

clearAllTimeouts();
