const apiRoute = require('./v1');
const jwt = require('express-jwt');
const {public_routes, jwt_algorithms} = require('../configs/config');
const {errorHandler} = require('../utils/utils');

const init = (server) => {

    server.all('*', function (req, res, next) {
        console.log('Request: ' + req.method + ' '
            + req.originalUrl + ' in: ' + new Date());
        console.log(JSON.stringify(req.body));
        return next();
    });


    server.use(
        jwt({
            secret: process.env.JWT_SECRET,
            algorithms: jwt_algorithms,
            getToken: req => req.signedCookies.token
        }).unless({path: public_routes})
        );

    // global error handler
    server.use(errorHandler);


    server.get('/api', (req, res ) => {
    	res.sendFile(__dirname + '/index.html');
    })
    
    server.use('/api', apiRoute);



}
module.exports = {
    init: init
};
