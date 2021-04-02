const { generateAlnum } = require('./utils');

module.exports.generateValidName = () => {
    return 'valid_username_' + generateAlnum(8);
}

module.exports.generateInvalidName = () => {
    return '2invalid';
}

module.exports.generateValidEmail = () => {
    return 'valid_email@' + generateAlnum(8) + '.example.com';
}

module.exports.generateInvalidEmail = () => {
    return 'invalid_email' + generateAlnum(8) + 'example';
}

module.exports.generateValidPassword = () => {
    return generateAlnum(8) + '#Q1';
}

module.exports.generateInvalidPassword = () => {
    return 'invalidpwd';
}

module.exports.createAndLoginUser = async(agent) => {
    const userData = {
        name: this.generateValidName(),
        email: this.generateValidEmail(),
        password: this.generateValidPassword(),
    };
    const registerUser = await agent.post('/api/v1/auth/register')
        .send(userData)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201);

    const loginUser = await agent.post('/api/v1/auth/login')
        .send(userData)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201);
    return loginUser;
};
