const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Event = sequelize.define('event', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: Sequelize.STRING,
    date: Sequelize.DATEONLY,
    venue: Sequelize.STRING,
    lat: Sequelize.FLOAT,
    long: Sequelize.FLOAT,
    description: Sequelize.STRING,
    rating: Sequelize.INTEGER,
    time: Sequelize.STRING
})

module.exports = Event;