if ('test' === process.env.NODE_ENV) {
    require('dotenv').config({ path: './.env.test' })
}
else {
    require('dotenv').config();
}
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const rfs = require('rotating-file-stream');
const path = require('path');
const jwt = require('express-jwt');
const { public_routes, jwt_algorithms } = require('../configs/config');
const { errorHandler } = require('../includes/utils');



const port = process.env.PORT || 4000;
const host = process.env.HOST || 'localhost';
const app = express();


const info = [
    `Platform: ${process.platform}`,
    `Node version: ${process.version}`,
];
require('child_process').exec('npm -v mongoose', function(err, stdout, stderr) {
    info.push('Mongoose version:', stdout.trim());
    console.log(info.join('; '));
});

//mongoose.Promise = global.Promise;
mongoose.connect(
    process.env.DB_CONNECT,
    { useNewUrlParser: true , useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false, },
    function(err) {
        if (err) {
            console.error('Mongo connection error:' + err.message);
            process.exit(1);
        }
        const admin = new mongoose.mongo.Admin(mongoose.connection.db);
        admin.buildInfo(function (err, info) {
            console.log('connected to mongodb ' + info.version);
        });
    });

// enable CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN, // front-end url
    credentials: true, // for secure httpOnly cookie
}));

// parse application/json
app.use(bodyParser.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

// use cookie parser for secure httpOnly cookie
app.use(cookieParser(process.env.COOKIE_SECRET));


// create a rotating write stream
const accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    path: path.join(__dirname, '../logs')
});

// setup the logger
app.use(morgan('combined', { stream: accessLogStream }))

// jwt autorization stored in client cookies
app.use(
    jwt({
        secret: process.env.JWT_SECRET,
        algorithms: jwt_algorithms,
        credentialsRequired: true,
        getToken: req => req.signedCookies.token,
    }).unless({path: public_routes})
);

// global error handler
app.use(errorHandler);

// Set up routes
let routes = require('../routes');
routes.init(app);

app.listen(port, function () {
    console.log('Express server listening on - http://' +
        host + ':' + port);
});

module.exports = app;
