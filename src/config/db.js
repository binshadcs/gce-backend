var mysql      = require('mysql2');
const { Host, Username, Password, Database, Port, DbUrl } = require('./config');

// const Db = mysql.createConnection({
//     // connectionLimit : 10,
//     host     : Host,
//     user     : Username,
//     password : Password,
//     database : Database,
//     port : Port
// });

const Db = mysql.createConnection(DbUrl)
if (Db){
    console.log("Database connected!");
}

module.exports = { Db }