const User = require('../models/user');
const { handleResponse } = require('../utils/utils');


const me = async (req, res) => {
	if (!req.user || !('email' in req.user) || !('password' in req.user)) {
		return handleResponse(req, res, 403, null, null, 'Autorization error');
	}

	await User.findOne({email: req.user.email}, (err, user) => {
		if (err || req.user.password != user.password) {
			return handleResponse(req, res, 403, null, null, 'Invalid token');
		}
		
		const ret = {email: user.email, name: user.name};

		return handleResponse(req, res, 200, ret, null, 'Token verified');
	});
}


module.exports = {
	me: me,
}