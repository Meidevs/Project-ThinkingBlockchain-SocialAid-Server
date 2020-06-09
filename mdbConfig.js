const mysql = require('mariadb');

var dbConfig = {
    host: '13.231.236.30',
    port: 3306,
    user: 'socialade',
    password: 'socialade!@',
    database: 'santa_coin',
};

const pool = mysql.createPool(dbConfig);
module.exports = pool;
