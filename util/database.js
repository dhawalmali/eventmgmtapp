const Sequelize = require('sequelize');
const sequelize = new Sequelize('event_mgmt_app','root','',{
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;