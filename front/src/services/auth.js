export const verifyAuthService = async () => {
	try {
		let response =  await fetch('/api/v1/auth/verify', { method: 'get'});
		let result = await response.json();
		return result;
	}

	catch (e) {
		return e;
	}
}