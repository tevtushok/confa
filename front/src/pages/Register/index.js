import React, { useState, useEffects } from 'react'
import { useForm } from 'react-hook-form';
import Bayan from '../../components/Bayan'
import Button from 'react-bootstrap/Button'
import { registerAuthService } from '../../services/auth'

import './index.scss';

export default function Rregister(props) {
    const { register, handleSubmit, watch, errors, reset, setError } = useForm();
    const [isRegistered, setRegistered] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [serviceMsg, setServiceMsg] = useState('');
    const onSubmit = (data) => {
        setLoading(true);
        setServiceMsg('');
        registerAuthService(data)
            .then(res => {
                setLoading(false);
                if (res.error) {
                    if (1005 === res.response.data.code) {
                        setError('email', {
                            type: 'manual',
                            message: 'Email should be unique'
                        });
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
            <div className="register">
                <h3 className="text-center">Register new user</h3>
                <div className="text-center">{name}, thanks for registration</div>
            </div>
        )
    }
    return (
        <div className="register">
            <h3 className="text-center">Register new user</h3>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group row">
                    <label htmlFor="name" className="col-sm-5 col-form-label">Name:</label>
                    <div className="col-sm-7">
                        <input type="text" id="name" name="name"
                            className={errors.name ? 'is-invalid form-control' : 'form-control'}
                            ref={register({ required: true, minLength: 3 })} placeholder="name"/>
                        {errors.name && <div className="text-danger">Atleast 3 characaters required</div>}
                    </div>
                </div>
                <div className="form-group row">
                    <label htmlFor="email" className="col-sm-5 col-form-label">Email:</label>
                    <div className="col-sm-7">
                        <input type="text" id="email" name="email"
                            className={errors.email ? 'is-invalid form-control' : 'form-control'}
                            ref={register({ message: 'mmmm', required: true, pattern: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i})}
                            placeholder="email" />
                        {errors.email && 'manual' != errors.email?.type && <div className="text-danger">Email is invalid</div>}
                        {errors.email?.message && <div className="text-danger">{errors.email.message}</div>}
                    </div>
                </div>
                <div className="form-group row">
                    <label htmlFor="password" className="col-sm-5 col-form-label">Password:</label>
                    <div className="col-sm-7">
                        <input type="password" id="password" name="password"
                            className={errors.password ? 'is-invalid form-control' : 'form-control'}
                            ref={register({required: true, minLength: 6})} placeholder="password" />
                        {errors.password && <div className="text-danger">Atleast 6 characaters required</div>}
                    </div>
                </div>
                <div className="form-group row">
                    <label htmlFor="password_confirm" className="col-sm-5 col-form-label">
                        Password confirm:
                    </label>
                    <div className="col-sm-7">
                    <input type="password" id="password_confirm" name="password_confirm"
                        className={errors.password ? 'is-invalid form-control' : 'form-control'}
                        ref={register({required: true, validate: validatePasswordConfirm})} placeholder="password confirm" />
                        {errors.password_confirm && <div className="text-danger">Invalid password confirmation</div>}
                    </div>
                </div>
                <div className="form-group">
                    <div className="login__serviceContainer">
                        {isLoading && (
                            <Bayan/>
                        )}
                        {serviceMsg.length > 0 && (
                            <p className="text-danger text-center">{serviceMsg}</p>
                        )}
                    </div>
                </div>
                <Button variant="primary" type="submit" block disabled={isLoading}>Register</Button>
            </form>
        </div>
    );
}
