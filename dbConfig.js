  
const mysql = require('mysql2/promise');

var dbConfig = {
    host: 'localhost',
    port: 33306,
    user: 'root',
    password: '1234',
    database: 'socialaid',
};

const pool = mysql.createPool(dbConfig);
module.exports = pool;