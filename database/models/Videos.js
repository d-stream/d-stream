const Sequelize = require('sequelize');
const db = require('../config/database');

const Video = db.define('videos', {
    category: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false

    },
    hash: {
        type: Sequelize.STRING,
        allowNull: false

    },
    title: {
        type: Sequelize.STRING,
        allowNull: false

    },
    address: {
        type: Sequelize.STRING,
        allowNull: false

    }, thumbnail: {
        type: Sequelize.STRING,
        allowNull: false
    }

}, {
        timestamps: false
    });


module.exports = Video;