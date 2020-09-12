
const apiRoute = require('./v1');

const init = (server) => {
    server.all('*', function (req, res, next) {
        console.log('Request: ' + req.method + ' '
            + req.originalUrl + ' in: ' + new Date());
        console.log(JSON.stringify(req.body));
        return next();
    });

    server.get('/api', (req, res ) => {
    	res.sendFile(__dirname + '/index.html');
    })
    
    server.use('/api', apiRoute);

}
module.exports = {
    init: init
};
