const apiRoute = require('./v1');
const adminApiRoute = require('./v1/admin')
const jwt = require('express-jwt');
const {public_routes, jwt_algorithms} = require('../configs/config');
const {errorHandler} = require('../utils/utils');

const init = (app) => {

    app.get('/api', (req, res ) => {
    	res.sendFile(__dirname + '/index.html');
    });

    app.all('*', function (req, res, next) {
        if (process.env.NODE_ENV !== 'test') {
            console.log('Request: ' + req.method + ' '
                + req.originalUrl + ' in: ' + new Date());
            console.log(JSON.stringify(req.body));
        }
        return next();
    });

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
    
    app.use('/api', apiRoute);
    app.use('/api', adminApiRoute);



}
module.exports = {
    init: init
};
