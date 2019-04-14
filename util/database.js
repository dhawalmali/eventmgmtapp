const Sequelize = require('sequelize');

const sequelize = new Sequelize('event_mgmt_app', 'root', 'dhawalroot', {
    host: 'dhawal.czszqruibg4u.ap-south-1.rds.amazonaws.com',
    port: 3306,
    logging: console.log,
    maxConcurrentQueries: 100,
    dialect: 'mysql',
    dialectOptions: {
        ssl:'Amazon RDS'
    },
    pool: { maxConnections: 5, maxIdleTime: 30},
    language: 'en'
})
module.exports = sequelize;