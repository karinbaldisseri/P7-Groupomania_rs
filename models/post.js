const Sequelize = require('sequelize');
const dbSequelize = require('../config/database');
const Comment = require('../models/comment');
const Like = require('../models/like');

const Post = dbSequelize.define('post', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER.UNSIGNED
  },
  content: {
    allowNull: false,
    type: Sequelize.STRING
  },
  imageUrl: {
    allowNull: true,
    type: Sequelize.STRING
  },
  likesTotal: {
    allowNull: false,
    type: Sequelize.INTEGER.UNSIGNED,
    defaultValue: 0
    // est-il possible de compter le nombre de likes ? value: {Likes.count( {where: {postId: this.id, likeValue: 1} })}
  },
  dislikesTotal: {
    allowNull: false,
    type: Sequelize.INTEGER.UNSIGNED,
    defaultValue: 0
    // est-il possible de compter le nombre de dislikes ? value: {Likes.count( {where: {postId: this.id, likeValue: -1} })}
  }
});

Post.hasMany(Comment, {
  foreignKey: { allowNull: false },
  onDelete: "CASCADE"
});
Comment.belongsTo(Post);

Post.hasMany(Like, {
  foreignKey: { allowNull: false },
  onDelete: "CASCADE"
});
Like.belongsTo(Post);

module.exports = Post;