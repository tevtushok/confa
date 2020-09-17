import React from 'react';
import Button from 'react-bootstrap/Button'
import {Link} from "react-router-dom";

import './index.scss';


class Login extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			username: '',
			password: '',
			buttonDisabled: false
		};
	}

	setUsername(username) {
		this.setState({'username': username});
	}

	setPassword(password) {
		this.setState({'password': password});
	}

	render() {

		return (
			<div className="login container">
			<div className="row">
				<form>
					<div className="form-group">
						<label htmlFor="email">Email:</label>
						<input type="text" className="form-control" name="email" id="email"/>
						<small className="text-danger">Name is required</small>
					</div>
					<div className="form-group">
						<label htmlFor="email">Password:</label>
						<input type="text" className="form-control" name="password" id="password"/>
						<small className="text-danger">Password is required</small>
					</div>
					<Button variant="primary" type="submit" size="lg" block>Login</Button>
					<Link to="/register" className="btn-block">
						<Button variant="secondary" size="lg" block>Register</Button>
					</Link>
				</form>
			</div>
			</div>
		);
	}

}

export default Login;
