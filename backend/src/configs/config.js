const public_routes = [
	'/api/',
	'/api/v1',
	'/api/v1/auth/login',
	'/api/v1/auth/register',
];

const jwt_algorithms = ['HS256'];

module.exports = {
	public_routes: public_routes,
	jwt_algorithms: jwt_algorithms
};
