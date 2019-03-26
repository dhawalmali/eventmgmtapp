const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const sequelize = require('./util/database');
const User = require('./models/user');
const cors = require('cors');

const userRoutes = require('./routes/user');

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.use(cors());

app.use('/user', userRoutes);

sequelize.sync().then(() => {
    app.listen(3000, () => {
        console.log('Server started at port 3000!!!');
    })
}).catch(err => {
    console.log(err);
})