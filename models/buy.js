const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Buy = sequelize.define('buy', {
    ticketId: Sequelize.INTEGER,
    userId : Sequelize.INTEGER,
    quantity: Sequelize.INTEGER,
    type: Sequelize.INTEGER
});

module.exports = Buy;