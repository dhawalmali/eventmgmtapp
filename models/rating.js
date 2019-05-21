const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Rating = sequelize.define('rating',{
    userId: Sequelize.INTEGER,
    eventId: Sequelize.INTEGER,
    flag: Sequelize.INTEGER
});

module.exports = Rating;