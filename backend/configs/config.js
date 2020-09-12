const dev = process.env.NODE_ENV !== 'production';

const config = {
	COOKIE_OPTIONS: {
	    // domain: "localhost",
	    httpOnly: true,
	    secure: !dev,
	    signed: true
	}
}

module.exports = config;