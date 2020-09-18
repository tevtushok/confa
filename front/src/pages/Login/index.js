import React from 'react';
import Button from 'react-bootstrap/Button'
import {Link, Redirect} from 'react-router-dom';
import { loginAuthService } from '../../services/auth'
import { inject } from 'mobx-react';

import './index.scss';

const emailRegExp = RegExp(
    /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/
)

@inject('userStore')
class Login extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			email: 'a5q@uskr.net',
			password: 'test123',
			errors: {},
			serviceMsg: '',
			isLoading: false,
		}
	}

	onSubmit = async (e) => {
		e.preventDefault();
		this.setState({serviceMsg: ''});
		this.validateEmail(this.state.email);
		this.validatePassword(this.state.password);
		if (Object.keys(this.state.errors).length) {
		}
		else {
			this.setState({isLoading: true});
			await loginAuthService(this.state.email, this.state.password)
				.then((res) => {
					this.setState({isLoading: false});
					if (res.error) {
						let message = (res.response.data.message)
							? res.response.data.message : res.response.statusText;
						this.setState({serviceMsg: message})
					}
					else {
						this.props.userStore.setUser(res.data.data.user);
					}
				});
		}
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
		if (emailRegExp.test(email)) {
			delete errors.email;
		}
		else {
			errors.email = 'Email address is invalid';
		}
		this.setState({'errors': errors});
	}

	validatePassword(password) {
		let { errors } = this.state;
		if (password.length > 5) {
			delete errors.password;
		}
		else {
			errors.password = 'Atleast 6 characaters required';
		}
		this.setState({'errors': errors});
	}

	render() {
		if (this.props.userStore.isLoggedIn) {
			return (
				<Redirect to="/schedule"/>
			);
		}
		const { errors } = this.state;
		const { serviceMsg } = this.state;
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
							<div className="form-group">
							<div className="text-danger serviceMsg">{serviceMsg}</div>
						</div>
						<div className="form-group">
							<Button variant="primary" type="submit" block disabled={this.state.isLoading}>Login</Button>
							<Link to="/register" className="btn-block">
								<Button variant="secondary" block>Register</Button>
							</Link>
						</div>

					</form>
				</div>
			</div>
		);
	}

}

export default Login;
