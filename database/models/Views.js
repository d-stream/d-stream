const Sequelize = require('sequelize');
const db = require('../config/database');
const Users = require('../models/Users');
const Video = require('./Videos');

const Views = db.define('views', {}, {
    timestamps: false
});
Users.belongsToMany(Video, {
    through: 'views'
});
Video.belongsToMany(Users, {
    through: 'views'
});

module.exports = Views;