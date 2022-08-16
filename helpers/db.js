require('dotenv').config();
module.exports = require('knex')({
  client: 'mysql',
  connection: {
    host : process.env.DB_HOST || '162.240.74.94',
    port : process.env.DB_PORT || 3306,
    user : process.env.DB_USER || 'wwcoti_pablo',
    password : process.env.DB_PASSWORD || '', //'9qT3GsV8yLm7yfH',
    database : process.env.DB_NAME || 'wwcoti_pablo'
  }
});