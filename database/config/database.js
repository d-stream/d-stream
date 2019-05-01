const Sequelize = require('sequelize');

// to be modified based on your local database
const db = new Sequelize('dstream', 'postgres', 'z', {
    dialect: 'postgres',
    host: 'localhost',
    logging: false
});

module.exports = db;