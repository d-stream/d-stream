const Sequelize = require('sequelize');
const db = require('../config/database');
const Users = require('../models/Users');
const Video = require('./Videos');

const Requests = db.define('requests', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true

    },
    request: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    timestamps: false
});


Video.hasMany(Requests);
Users.hasMany(Requests);

module.exports = Requests;