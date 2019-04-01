const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Photo = sequelize.define('photo',{
    id:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    url: Sequelize.STRING
})

module.exports = Photo;