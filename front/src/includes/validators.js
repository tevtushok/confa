export const validateEmail = (email = '') => {
    const emailRegExp = RegExp(
        /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/
    )
    const isValid = emailRegExp.test(email);
    return isValid ? true : { message: 'Invalid Email' };
}

export const validatePassword = (password = '') => {
    const isValid = password < 6;
    return isValid ? true : { message: 'Atleast 6 characaters required' };
}
