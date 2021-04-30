const apiRoute = require('./v1');
const adminApiRoute = require('./v1/admin')

const init = (app) => {

    app.get('/api', (req, res ) => {
    	res.sendFile(__dirname + '/index.html');
    });

    app.all('*', function (req, res, next) {
        if (process.env.NODE_ENV === 'development') {
            console.log('Request: ' + req.method + ' '
                + req.originalUrl + ' in: ' + new Date(), 'body:', JSON.stringify(req.body));
        }
        return next();
    });

    app.use('/api', apiRoute);
    app.use('/api/admin', adminApiRoute);

}
module.exports = {
    init: init
};
