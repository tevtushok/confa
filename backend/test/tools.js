const generateAlnum = (n) => {
    let str = '';
    while(str.length < n) {
        let sub = Math.random().toString(36).substring(2);
        str += sub;
    }
    return str.substring(0,n);
}

const generateValidUserName = () => {
    return 'valid_username_' + generateAlnum(8);
}

const generateValidEmail = () => {
    return 'valid_email@' + generateAlnum(8) + '.example.com';
}

const generateInValidEmail = () => {
    return 'invalid_email' + generateAlnum(8) + 'example';
}

const generateValidPassword = () => {
    return generateAlnum(8) + '#Q';
}

module.exports = {
    generateAlnum: generateAlnum,
    generateValidEmail: generateValidEmail,
    generateInValidEmail: generateInValidEmail,
    generateValidUserName: generateValidUserName,
    generateValidPassword: generateValidPassword,
}
