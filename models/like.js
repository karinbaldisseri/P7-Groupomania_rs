const Sequelize = require('sequelize');
const dbSequelize = require('../config/database');

const Like = dbSequelize.define('like', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER.UNSIGNED
  },
  likeValue: {
    allowNull: false,
    type: Sequelize.INTEGER,
    defaultValue: 1 // OBLIGÉ ??
    // pas besoin car je ne gère que les cas 1, 0 et -1 
    /* type: Sequelize.ENUM,
    values: [1, -1] */ /// mais fait crasher l'app => if error => throw new Error('Do not try to set the "username" value !');
  }
});

module.exports = Like;