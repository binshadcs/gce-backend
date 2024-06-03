require('dotenv').config()

const JwtScret = process.env.JWT_SECRET;
const Host = process.env.HOST;
const Port = process.env.PORT;
const Username = process.env.USERNAME;
const Password = process.env.PASSWORD;
const Database = process.env.DATABASE;
const DbUrl = process.env.DBURL

module.exports = {
    JwtScret, 
    Host, 
    Port, 
    Username, 
    Password, 
    Database,
    DbUrl
};