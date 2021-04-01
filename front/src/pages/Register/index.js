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
        setLoading(true);
        registerAuthService(data)
            .then(res => {
                setLoading(false);
                if (res.error) {
                    if (1005 === res.response.data.code) {
                        setError('email', {
                            type: 'manual',
                            message: 'Email should be unique'
                        });
                        setServiceMsg('');
                    }
                    else {
                        let message = (res.response.data.message)
                        ? res.response.data.message : res.response.statusText;
                        setServiceMsg(message);
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
    const helperTextName = errors.name ? 'Atleast 3 characaters required' : '';
    let helperTextEmail = '';
    if (errors.email) {
        helperTextEmail = errors.email?.message ? errors.email.message : 'Email is invalid';
    }
    const helperTextPassword = errors.password ? 'Atleast 6 characaters is required' : '';
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
                        fullwidth
                        error={!!errors.name}
                        helperText={helperTextName}
                        label="Name:"
                        variant="outlined"
                        type="text"
                        rules={{ required: true, minLength: 3 }}
                    />

                    <Controller
                        name="email"
                        as={TextField}
                        control={control}
                        defaultValue=""
                        fullwidth
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
                        fullwidth
                        error={!!errors.password}
                        helperText={helperTextPassword}
                        label="Password:"
                        variant="outlined"
                        type="password"
                        rules={{required: true, minLength: 6}}
                    />

                    <Controller
                        name="password_confirm"
                        as={TextField}
                        control={control}
                        defaultValue=""
                        fullwidth
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
                        <Button variant="contained" color="secondary" size="large" fullwidth type="submit" disabled={isLoading}>Register</Button>
                    </FormControl>
                </form>
            </div>
        </Container>
    );
}
