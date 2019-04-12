const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const sequelize = require('./util/database');
const User = require('./models/user');
const Category = require('./models/category');
const Event = require('./models/event');
const Photo = require('./models/photo');
const Tag = require('./models/tag');
const Ticket = require('./models/ticket');
const Buy = require('./models/buy');
const cors = require('cors');

const userRoutes = require('./routes/user');
const eventRoutes = require('./routes/event');
const ticketRoutes = require('./routes/ticket');

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.use(cors());

app.use('/user', userRoutes);
app.use('/event', eventRoutes);
app.use('/ticket', ticketRoutes);

User.hasMany(Event);
Event.hasOne(Category);
Event.hasMany(Photo);
Event.hasMany(Tag);
Event.hasOne(Category);
Event.hasMany(Ticket);


sequelize.sync().then(() => {
    app.listen(3000, () => {
        console.log('Server started at port 3000!!!');
    })
}).catch(err => {
    console.log(err);
})