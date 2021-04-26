import React from 'react'
import Bayan from '../../components/Bayan'
import { Button, Container, FormControl, TextField, FormHelperText, } from '@material-ui/core'
import { observer, inject } from 'mobx-react';

import './index.scss';

@inject('authStore')
@observer
class Register extends React.Component {
    componentWillUnmount() {
        this.props.authStore.reset();
    }

    handleSubmit = e => {
        e.preventDefault();
        this.props.authStore.register()
            .then(() => {
                this.props.history.replace('/');
            })
            .catch(e => {
                console.log(e);
            });
    }

    handleChangeName = e => {
        this.props.authStore.setName(e.target.value);
    }

    handleChangeEmail = e => {
        this.props.authStore.setEmail(e.target.value);
    }

    handlePasswordChange = e => {
        this.props.authStore.setPassword(e.target.value);
    }

    handlePasswordConfirmChange = e => {
        this.props.authStore.setPasswordConfirm(e.target.value);
    }

    render() {
        const errors = this.props.authStore.errors;
        console.log('errors', errors.email);
        const helperTextName = errors?.name?.message || 'Name should starts with letter, and contain minimum 3 character';
        const helperTextEmail = errors?.email?.message || 'Email is invalid';
        const helperTextPasswordConfirmation = errors?.password_confirm?.message || 'Invalid password confirmation';
        const helperTextPassword = errors?.password?.message || 'Password must contain 8 characters and at least one number, one letter and one special character';
        const serviceMessage = this.props.authStore.serviceMessage;
        return (
            <Container maxWidth="sm">
                <div className="register page">
                    <h2 className="text-center">Register new user</h2>

                    <form onSubmit={this.handleSubmit}>
                        <FormControl error={!!errors.name}>
                            <TextField
                                name="name"
                                onChange={this.handleChangeName}
                                id="name"
                                label="Name:"
                                fullWidth
                                variant="outlined"
                            />
                            {!!errors.name && <FormHelperText className="errorHelper">{helperTextName}</FormHelperText> }
                        </FormControl>

                        <FormControl error={!!errors.email}>
                            <TextField
                                onChange={this.handleChangeEmail}
                                name="email"
                                fullWidth
                                label="Email:"
                                variant="outlined"
                            />
                            {!!errors.email && <FormHelperText className="errorHelper">{helperTextEmail}</FormHelperText> }
                        </FormControl>

                        <FormControl error={!!errors.password}>
                            <TextField
                                onChange={this.handlePasswordChange}
                                name="password"
                                fullWidth
                                label="Password:"
                                variant="outlined"
                                type="password"
                            />
                            {!!errors.password && <FormHelperText id="password-error">{helperTextPassword}</FormHelperText>}
                        </FormControl>

                        <FormControl error={!!errors.password_confirm}>
                            <TextField
                                onChange={this.handlePasswordConfirmChange}
                                name="password_confirm"
                                fullWidth
                                label="Password confirm:"
                                variant="outlined"
                                type="password"
                            />
                            {!!errors.password_confirm && <FormHelperText>{helperTextPasswordConfirmation}</FormHelperText>}
                        </FormControl>

                        <FormControl error={!!serviceMessage.length} className="serviceMessage">
                            {this.props.authStore.inProgress && <Bayan/>}
                            <FormHelperText>{serviceMessage}</FormHelperText>
                        </FormControl>

                        <FormControl>
                            <Button variant="contained" color="secondary"  fullWidth type="submit"
                                disabled={this.props.authStore.inProgress}>Register
                            </Button>
                        </FormControl>

                    </form>
                </div>
            </Container>
        );
    }
}

export default Register;
