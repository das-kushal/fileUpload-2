if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}


const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const { v4: uuid } = require('uuid');
const mongoose = require('mongoose');
const app = express();
const auth = require('./config/auth');
const multer = require('multer');
const router = require('./router');
require('./config/passport')

const port = process.env.PORT || 5001;

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('**Connected to database**');
}).catch((err) => {
    console.log(err);
});


app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: uuid(),
    resave: true,
    saveUninitialized: true
}));

app.use(router)



app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});