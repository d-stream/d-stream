const Sequelize = require('sequelize');
const db = require('../config/database');

const Users = db.define('users', {
    address: {
        type: Sequelize.STRING,
        allowNull: false

    }
}, {
    timestamps: false
});


module.exports = Users;