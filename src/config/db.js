var mysql      = require('mysql2');
const { Host, Username, Password, Database, Port, DbUrl } = require('./config');

const Db = mysql.createConnection(DbUrl)

module.exports = { Db }