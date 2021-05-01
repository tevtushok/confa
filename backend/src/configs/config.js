const prod = process.env.NODE_ENV === 'production';

const cookie_options = {
	    // domain: "localhost",
	    httpOnly: true,
	    secure: prod,
	    signed: true
}

const public_routes = [
	'/api/',
	'/api/v1',
	'/api/v1/auth/login',
	'/api/v1/auth/verify',
	'/api/v1/auth/register',
];

const jwt_algorithms = ['HS256'];

module.exports = {
	cookie_options: cookie_options,
	public_routes: public_routes,
	jwt_algorithms: jwt_algorithms
};
