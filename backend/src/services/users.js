const User = require('../models/user');
const { jsonResponse } = require('../includes/utils');

const me = async (req, res) => {
	if (!req.user || !('email' in req.user) || !('password' in req.user)) {
		return jsonResponse(req, res, 403, null, null, 'Autorization error');
	}

	await User.findOne({email: req.user.email}, (err, user) => {
		if (err || req.user.password != user.password) {
			return jsonResponse(req, res, 403, null, null, 'Invalid token');
		}
		
		const ret = {email: user.email, name: user.name};

		return jsonResponse(req, res, 200, null, ret, 'Token verified');
	});
}


module.exports = {
	me: me,
}
