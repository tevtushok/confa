import React from 'react';
import Button from 'react-bootstrap/Button'
import {Link} from 'react-router-dom';
import API from '../../services/api'

import './index.scss';

const emailRegExp = RegExp(
    /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/
)


class Login extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			email: 'tim@ukr.net',
			password: 'password123',
			errors: {}
		}
	}

	onSubmit = e => {
		e.preventDefault();
		console.log(this.state);
		this.validateEmail(this.state.email);
		this.validatePassword(this.state.password);
		if (Object.keys(this.state.errors).length) {
			console.log('invalid');
		}
		else {
			const data = {'email': this.state.email, 'password': this.state.password};
			const result = API.get('/auth/login', data);
			console.log(result)
		}
		console.log(this.state.email, this.state.password)
	};

	handleChange = e => {
		e.preventDefault();
		const { name, value } = e.target;
		this.setState({[name]: value});
		switch (name) {
			case 'email':
				this.validateEmail(value);
				break;
			case 'password':
				this.validatePassword(value);
				break;
			default:
				break;
		}
	}

	validateEmail (email) {
		let { errors } = this.state;
		console.log(email, emailRegExp.test(email));
		if (emailRegExp.test(email)) {
			console.log('valid email')
			delete errors.email;
		}
		else {
			errors.email = 'Email address is invalid';
			console.log('iiiiiivalid email')
		}
		this.setState({'errors': errors});
	}

	validatePassword(password) {
		let { errors } = this.state;
		console.log(this.state);
		if (password.length > 5) {
			delete errors.password;
		}
		else {
			errors.password = 'Atleast 6 characaters required';
		}
		this.setState({'errors': errors});
	}

	render() {
		const { errors } = this.state;
		return (
			<div className="login container">
			<div className="row text-center">
				<form onSubmit={this.onSubmit} noValidate>
					<div className="form-group">
						<label htmlFor="email">Email:</label>
						<input type="text" name="email" id="email" onChange={this.handleChange} value={this.state.email}
							className={'email' in errors ? "form-control is-invalid" : "form-control"}/>
		
					</div>
					<div className="form-group">
						<label htmlFor="password">Password:</label>
						<input type="text" name="password" id="password" onChange={this.handleChange} value={this.state.password}
						className={'password' in errors ? "form-control is-invalid" : "form-control"}/>
			
					</div>
					<Button variant="primary" type="submit" block>Login</Button>
					<Link to="/register" className="btn-block">
						<Button variant="secondary" block>Register</Button>
					</Link>
				</form>
			</div>
			</div>
		);
	}

}

export default Login;
