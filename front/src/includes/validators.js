export const validateEmail = (email = '') => {
    const emailRegExp = RegExp( /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/);
    const isValid = emailRegExp.test(email);
    return isValid ? true : { message: 'Invalid Email' };
}

export const validatePassword = (password = '') => {
    const passwordRegexp = /^.*(?=.{8,})(?=.*[a-zA-Z])(?=.*\d)(?=.*[!#$%&? "]).*$/;
    const isValid = passwordRegexp.test(password);
    return isValid ? true: { message: 'must contain 8 characters and at least one number, one letter and one unique character such as !#$%&?' };
}

export const validateName = (name) => {
    const nameRegexp = RegExp(/^[a-z]\w{2,30}$/i);
    const isValid = nameRegexp.test(name);
    return isValid ? true : { message: 'Name should starts with letter, and contain minimum 3 character' };
}
