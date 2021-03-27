'use strict';

const Application = require('./Application.js');
const mysql = require('mysql');
const Promise = require('bluebird');
const logger = Application.getLogger('database');

const Database = {
    createDbConnection() {
        return mysql.createConnection({
            host     : process.env.DATABASE_HOST,
            port     : process.env.DATABASE_PORT,
            user     : process.env.DATABASE_USER,
            password : process.env.DATABASE_PASS,
            database : process.env.DATABASE_NAME,
            charset : 'utf8mb4',
        });
    },

    getTimeout(userId, type) {
        return new Promise(function(resolve, reject) {
            const connection = Database.createDbConnection();
            const query = connection.query('SELECT * FROM timeout WHERE user_id = ? and type = ?', [userId, type], function(error, results) {
                if (results === undefined) {
                    reject(new Error('Error results is undefined'));
                }
                else {
                    resolve(results);
                }
            });

            logger.debug('Timeout select query: ' + query.sql);

            connection.end();
        });
    },

    setTimeout(userId, type) {
        return new Promise(function(resolve, reject) {
            const connection = Database.createDbConnection();
            const query = connection.query('INSERT INTO timeout (`user_id`, `type`) VALUES (?, ?)', [userId, type], function(error, results) {
                if(results === undefined) {
                    reject(new Error('Error results is undefined'));
                }
                else {
                    resolve(results);
                }
            });

            logger.debug('Timeout insert query: ' + query.sql);

            connection.end();
        });
    },
};

module.exports = Database;
