// CONNECTION to DATABASE with SEQUELIZE
require('dotenv').config();
const Sequelize = require('sequelize');

module.exports = new Sequelize(`${process.env.DB_CONNECTION_NAME}`, `${process.env.DB_CONNECTION_USERNAME}`, `${process.env.DB_CONNECTION_PASSWORD}`, {
  host: 'localhost',  
  dialect: 'mysql',
  },
);

/* module.exports = new Sequelize('groupomania', 'groupomaniauser', 'Mskb1204inka!', {
  host: 'localhost',  
  dialect: 'mysql',
  },
); */