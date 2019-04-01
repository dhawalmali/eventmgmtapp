const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Category = sequelize.define('category',{
    type: Sequelize.STRING
})

module.exports = Category;