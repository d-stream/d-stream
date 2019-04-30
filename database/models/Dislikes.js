const Sequelize = require('sequelize');
const db = require('../config/database');
const Users = require('../models/Users');
const Video = require('./Videos');

const Dislikes = db.define('dislikes', {}, {
    timestamps: false
});
Users.belongsToMany(Video, {
    through: 'dislikes'
});
Video.belongsToMany(Users, {
    through: 'dislikes'
});

module.exports = Dislikes;