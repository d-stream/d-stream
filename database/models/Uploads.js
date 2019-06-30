const Sequelize = require('sequelize');
const db = require('../config/database');
const Users = require('../models/Users');
const Video = require('./Videos');

const Uploads = db.define('uploads', {}, {
    timestamps: false
});
Users.belongsToMany(Video, {
    through: 'uploads'
});
Video.belongsToMany(Users, {
    through: 'uploads'
});

module.exports = Uploads;