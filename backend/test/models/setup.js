const dbHandler = require('./dbHandler');

before(async () => await dbHandler.connect());
after(async () => await dbHandler.closeDatabase());
beforeEach(async () => await dbHandler.clearDatabase());
