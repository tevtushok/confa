const dbHandler = require('./dbHandler');

before(async () => {
    await dbHandler.connect();
});

after(async () => {
    await dbHandler.clearDatabase();
    await dbHandler.closeDatabase();
});
