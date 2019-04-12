const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Ticket = sequelize.define('ticket',{
    id:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    quantity: Sequelize.INTEGER,
    price: Sequelize.FLOAT,
    description: Sequelize.STRING,
    endDate: Sequelize.DATE,
    type: Sequelize.INTEGER 
})

module.exports = Ticket;