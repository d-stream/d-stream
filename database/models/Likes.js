const Sequelize = require('sequelize');
const db = require('../config/database');
const Users = require('../models/Users');
const Video = require('./Videos');

const Likes = db.define('likes', {}, {
    timestamps: false
});
Users.belongsToMany(Video, {
    through: 'likes'
});
Video.belongsToMany(Users, {
    through: 'likes'
});

module.exports = Likes;