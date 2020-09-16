const server = require('./core/app');

server.create(err => {
    if (err) {
        console.log(err);
        return;
    }
    server.start();
});
