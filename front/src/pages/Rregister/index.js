import React, { useState } from 'react'
import { useForm } from 'react-hook-form';

export default function Rregister() {
    const { register, handleSubmit, watch, errors } = useForm();
    const onSubmit = (data) => {
        console.log(data);
        console.log(errors);
    }
    const validatePasswordConfirm = (value) => {
        const password = watch('password');
        return password === value; 
    }
    return (
        <div className="rregister">
            <form onSubmit={handleSubmit(onSubmit)}>
                <input type="text" name="name" ref={register({ required: true, minLength: 3 })} placeholder="name" />
                {errors.name && <span>name is required</span>}
        <br/>
                <input type="text" name="email" ref={register({ pattern: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i})} placeholder="email" />
                {errors.email && <span>email is invalid</span>}
        <br/>
                <input type="password" name="password" ref={register({required: true, minLength: 6})} placeholder="password" />
                {errors.password && <span>pwd errom</span>}
        <br/>
                <input type="password" name="password_confirm" ref={register({validate: validatePasswordConfirm})} placeholder="password confirm" />
                {errors.password_confirm && <span>passwords dis match</span>}
        <br/>
                <input type="submit" value="submit"/>
            </form>
        </div>
    );
}
