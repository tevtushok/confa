import React from 'react';
import { Link as LinkRouter, Redirect } from 'react-router-dom';
import authApi from '../../services/authApi'
import CODES from '../../services/codes'
import { inject } from 'mobx-react';
import Bayan from '../../components/Bayan'
import { Container, FormControl, TextField, Button, Link, FormHelperText } from '@material-ui/core'

import './index.scss';

const emailRegExp = RegExp(
    /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/
)

@inject('userStore')
@inject('appStore')
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
        console.log('onSubmit', 123);
		this.setState({serviceMsg: ''});
		this.validateEmail(this.state.email);
		this.validatePassword(this.state.password);
		if (!Object.keys(this.state.errors).length) {
			this.setState({isLoading: true});
            authApi.login(this.state.email, this.state.password)
                .then(({ response }) => {
                    const apiData = response.getApiData();
                    this.props.userStore.setUser(apiData.user);
                    this.props.appStore.setToken(apiData.user.token);
                })
                .catch(({ error, response }) => {
                    const apiMessage = response.getApiMessage();
                    const apiData = response.getApiData();
                    const apiCode = response.getApiCode();
                    switch(apiCode) {
                        case CODES.AUTH.INVALID_CREDENTIALS:
                        case CODES.AUTH.EMPTY_CREDENTIALS:
                            this.setState({serviceMsg: 'Invalid credentials'})
                            break;
                        default:
                            console.log('default case', response.statusText, apiMessage);
                            const message = apiMessage ? apiMessage : response.statusText;
                            this.setState({serviceMsg: message})
                    }
                }).finally(() => {
                    this.setState({isLoading: false});
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

	validateEmail(email) {
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
        console.log('Login page render', 'isLoading', this.props.userStore.isLoggedIn);
		if (this.props.userStore.isLoggedIn) {
            return (
                <Redirect to="/"/>
            );
		}
		const { errors } = this.state;
		const { serviceMsg } = this.state;
		return (
			<Container maxWidth="sm">
				<div className="login page">
					<h2 className="text-center">Login page</h2>
					<form onSubmit={this.onSubmit} noValidate>
						<FormControl className="login__form-control">
							<TextField
								name="email"
								label="Email:"
								value={this.state.email}
								fullWidth={true}
								variant="outlined"
								type="text"
								onChange={this.handleChange}
								error={!!errors?.email} />
						</FormControl>
						<FormControl className="login__form-control">
							<TextField
								name="password"
								label="Password:"
								value={this.state.password}
								fullWidth={true}
								variant="outlined"
								type="password"
								onChange={this.handleChange}
								error={!!errors?.password} />
						</FormControl>
						<FormControl error={!!serviceMsg.length} className="login__serviceContainer">
							{this.state.isLoading && (
								<Bayan/>
							)}
							<FormHelperText>{serviceMsg}</FormHelperText>
						</FormControl>
						<FormControl>
							<Button variant="contained" color="secondary"  fullWidth type="submit" disabled={this.state.isLoading}>Login</Button>
						</FormControl>
						<p className="login__invite">
							<Link color="primary" component={LinkRouter} to="/register">
								Don't have account? click register
							</Link>
						</p>
					</form>
				</div>
			</Container>
		);
	}

}

export default Login;
