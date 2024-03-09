const mysql = require('mysql2');
require('dotenv').config()

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME,
};

const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
    if (err) {
        console.error(err);
    }
    else {
        console.log(`Connection has been established successfully`);
    }
});

module.exports = connection;
