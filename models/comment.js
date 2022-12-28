const Sequelize = require('sequelize');
const dbSequelize = require('../config/database');

const Comment = dbSequelize.define('comment', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER.UNSIGNED
  },
  content: {
    allowNull: false,
    type: Sequelize.STRING
  }
});

module.exports = Comment;