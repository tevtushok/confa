module.exports.generateAlnum = (n) => {
    let str = '';
    while(str.length < n) {
        let sub = Math.random().toString(36).substring(2);
        str += sub;
    }
    return str.substring(0,n);
}

module.exports.generateValidName = () => {
    return 'valid_username_' + this.generateAlnum(8);
}

module.exports.generateInvalidName = () => {
    return '2invalid';
}

module.exports.generateValidEmail = () => {
    return 'valid_email@' + this.generateAlnum(8) + '.example.com';
}

module.exports.generateInvalidEmail = () => {
    return 'invalid_email' + this.generateAlnum(8) + 'example';
}

module.exports.generateValidPassword = () => {
    return this.generateAlnum(8) + '#Q1';
}

module.exports.generateInvalidPassword = () => {
    return 'invalidpwd';
}
