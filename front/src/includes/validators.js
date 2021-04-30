export const validateEmail = (email = '') => {
    const emailRegExp = RegExp( /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/);
    const isValid = emailRegExp.test(email);
    return isValid ? true : { message: 'Invalid Email' };
}

export const validateUserName = (name) => {
    const nameRegexp = RegExp(/^[a-z]\w{2,30}$/i);
    const isValid = nameRegexp.test(name);
    return isValid ? true : { message: 'Name should starts with letter, and contain minimum 3 character' };
}

export const validatePassword = (password = '') => {
    const passwordRegexp = /^.*(?=.{8,})(?=.*[a-zA-Z])(?=.*\d)(?=.*[!#$%&? "]).*$/;
    const isValid = passwordRegexp.test(password);
    return isValid ? true: { message: 'must contain 8 characters and at least one number, one letter and one unique character such as !#$%&?' };
}

export const validateRoomTitle = (title) => {
    const isValid = ((typeof title === 'string' || title instanceof String)
        && title.length >= 3)
    return isValid ? true : { message: 'Atleast 3 characaters required' };
}

export const validateRoomNumber = (number) => {
    // eslint-disable-next-line
    const isValid = number && (number == (number ^ 0));
    return isValid ? true : { message: 'Allowed only integers' };
}
