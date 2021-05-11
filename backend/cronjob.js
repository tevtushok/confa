require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const srcDir = path.resolve(__dirname, './src');
const scriptArgs = process.argv.slice(2);
require('dotenv').config({
    path: path.resolve(srcDir, '.env'),
})
const Event = require(path.join(srcDir, 'models/event.js'));

mongoose.connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});

const doDisableExpiredEvents = () => {
	const currentDate = new Date().toISOString();
	console.log('lookig for date_start lte:', currentDate);
	Event.updateMany(
		{ status: 'active', date_end: { $lte: currentDate } },
		{ status: 'closed'},
		(error, res) => {
			let code = 0;
			if (error) {
				console.log(error);
				process.exit(1);
			}
			else {
				const { n, nModified } = res;
				console.log(' n:', n, 'nModified:', nModified);
				process.exit(0);
			}
		},
	);
}

function main() {
	switch(scriptArgs[0]) {
		case 'disableExpired':
			doDisableExpiredEvents();
			break;
		default:
			console.log('invalid argument');
			process.exit(0);
	}
}

main();

// * * * * * /path/to/your/script
