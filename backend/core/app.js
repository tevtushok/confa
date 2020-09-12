require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const mongoose = require('mongoose')

const authRoute = require('../routes/auth');


const app = express();

let server = {
	create: () => {

		mongoose.connect(
			process.env.DB_CONNECT,
			{
				useNewUrlParser: true ,
				useUnifiedTopology: true,
				useCreateIndex: true,
			},
			console.log('connected to mongo')
		);

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

		// import routes
		//app.use('/api/auth', authRoute);

		//app.get('/', (req, res) => {
		//	res.send('Welcome to confa api');
		//})

		// Set up routes
		let routes = require('../routes');
        routes.init(app);

	},
	start: () => {
		const port = process.env.PORT || 4000;
		const host = process.env.HOST || 'localhost';
		app.listen(port, function () {
			console.log('Express server listening on - http://' + host + ':' + port);
		});
	}
};


module.exports = server;