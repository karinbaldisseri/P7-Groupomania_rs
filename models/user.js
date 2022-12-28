const Sequelize = require('sequelize');
const dbSequelize = require('../config/database');
const Post = require('../models/post');
const Comment = require('../models/comment');
const Like = require('../models/like');

const User = dbSequelize.define('user', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER.UNSIGNED
  },
  email: {
    allowNull: false,
    type: Sequelize.STRING,
    unique: true
  },
  firstname: {
    allowNull: false,
    type: Sequelize.STRING
  },
  lastname: {
    allowNull: false,
    type: Sequelize.STRING
  },
  password: {
    allowNull: false,
    type: Sequelize.STRING
  },
  isAdmin: {
    allowNull: false,
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    allowNull: false,
    type: Sequelize.BOOLEAN,
    defaultValue: true
  },
  username: {
    type: Sequelize.VIRTUAL,
    get() {
      return `${this.firstname}${this.lastname}`;
    },
    set(value) {
      throw new Error('Do not try to set the "username" value !');
    }
  }
});

User.hasMany(Post, {
  foreignKey: { allowNull: false },
  onDelete: "CASCADE"
});
Post.belongsTo(User);

User.hasMany(Comment, {
  foreignKey: { allowNull: false },
  onDelete: "CASCADE"
});
Comment.belongsTo(User);

User.hasMany(Like, {
  foreignKey: { allowNull: false },
  onDelete: "CASCADE"
});
Like.belongsTo(User);

/* User.sync({ alter: true })
  .then(() => {
    return User.create({
      email: "admin@me.com",
      firstname: "ad",
      lastName: "min1",
      password: "Admin1abc",
      isAdmin: true
    });
  })
  .then(() => console.log("Admin added to Database"))
  .catch((error) => console.log(error)); */

module.exports = User;