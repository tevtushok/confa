import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form';
import Bayan from '../../components/Bayan'
import { Button, Container, FormControl, TextField, FormHelperText } from '@material-ui/core'
import { registerAuthService } from '../../services/auth'

import './index.scss';


export default function Resister(props) {
    const { handleSubmit, watch, errors, reset, setError, control } = useForm();
    const [isRegistered, setRegistered] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [serviceMsg, setServiceMsg] = useState('');
    const onSubmit = (data) => {
        setServiceMsg('');
        setLoading(true);
        registerAuthService(data)
            .then(res => {
                setLoading(false);
                if (res.error) {
                    if (1002 === res.response.data.code) {
                        setError('email', {
                            type: 'manual',
                            message: 'Email should be unique'
                        });
                    }
                    // validation errors on server
                    else if (1001 === res.response.data.code) {
                        let message = 'Server validation error';
                        console.log(res.response.data.data.errors);
                        Object.keys(res.response.data.data.errors).forEach(name => {
                            message += "<br/>" + name + ": " + res.response.data.data.errors[name].message;
                        });
                        setServiceMsg(message);
                    }
                    // server error
                    else {
                        setServiceMsg('Server error' + res.response.data.message);
                    }
                }
                else {
                   setRegistered(true);
                   setName(data.name);
                   setServiceMsg('');
                   reset();
                }

            })
    }
    const validatePasswordConfirm = (value) => {
        const password = watch('password');
        return password === value;
    }
    if (isRegistered) {
        return (
            <Container maxWidth="sm">
            <div className="register component registered">
                <h2 className="text-center">Register new user</h2>
                <div className="text-center">{name}, thanks for registration</div>
            </div>
            </Container>
        )
    }
    const helperTextName = errors.name ? 'Name should starts with letter, and contain minimum 3 character' : '';
    let helperTextEmail = '';
    if (errors.email) {
        helperTextEmail = errors.email?.message ? errors.email.message : 'Email is invalid';
    }
    const helperTextPassword = errors.password ? 'Password must contain 8 characters and at least one number, one letter and one unique character such as !#$%&?' : '';
    const helperTextPasswordConfirmation = errors.password_confirm ? 'Invalid password confirmation' : '';

    return (
        <Container maxWidth="sm">
            <div className="register page">
                <h2 className="text-center">Register new user</h2>

                <form onSubmit={handleSubmit(onSubmit)}>
                      <Controller
                        name="name"
                        as={TextField}
                        control={control}
                        defaultValue=""
                        fullWidth
                        error={!!errors.name}
                        helperText={helperTextName}
                        label="Name:"
                        variant="outlined"
                        type="text"
                        rules={{required: true, pattern: /^[a-z]\w{2,30}$/i}}
                    />

                    <Controller
                        name="email"
                        as={TextField}
                        control={control}
                        defaultValue=""
                        fullWidth
                        error={!!errors.email}
                        helperText={helperTextEmail}
                        label="Email:"
                        variant="outlined"
                        type="text"
                        rules={{required: true, pattern: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i}}
                    />

                    <Controller
                        name="password"
                        as={TextField}
                        control={control}
                        defaultValue=""
                        fullWidth
                        error={!!errors.password}
                        helperText={helperTextPassword}
                        label="Password:"
                        variant="outlined"
                        type="password"
                        rules={{required: true, pattern: /^.*(?=.{8,})(?=.*[a-zA-Z])(?=.*\d)(?=.*[!#$%&? "]).*$/}}
                    />

                    <Controller
                        name="password_confirm"
                        as={TextField}
                        control={control}
                        defaultValue=""
                        fullWidth
                        error={!!errors.password_confirm}
                        helperText={helperTextPasswordConfirmation}
                        label="Password confirm:"
                        variant="outlined"
                        type="password"
                        rules={{required: true, validate: validatePasswordConfirm}}
                    />
                    <FormControl error={!!serviceMsg.length} className="register__serviceContainer">
                        {isLoading && <Bayan/>}
                        <FormHelperText>{serviceMsg}</FormHelperText>
                    </FormControl>
                    <FormControl>
                        <Button variant="contained" color="secondary"  fullWidth type="submit" disabled={isLoading}>Register</Button>
                    </FormControl>
                </form>
            </div>
        </Container>
    );
}
