import React from 'react';
import { Link as LinkRouter } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import Bayan from '../../components/Bayan';
import { Container, FormControl, TextField, Button, Link, FormHelperText } from '@material-ui/core'

import './index.scss';


@inject('authStore')
@observer
class Login extends React.Component {
    componentWillUnmount() {
        this.props.authStore.reset();
    }

	handleSubmit = e => {
        e.preventDefault();
        this.props.authStore.login().then(() => this.props.history.replace("/"));
	};

	handleEmailChange = e => {
        console.log(e.target.value);
        this.props.authStore.setEmail(e.target.value);
	}

	handlePasswordChange = e => {
        this.props.authStore.setPassword(e.target.value);
	}

	render() {
        console.log('Login page render');
		const errors = this.props.authStore.errors;
		const serviceMessage = this.props.authStore.serviceMessage;
		return (
			<Container maxWidth="sm">
				<div className="login page">
					<h2 className="text-center">Login page</h2>
					<form onSubmit={this.handleSubmit} noValidate>
						<FormControl className="login__form-control">
							<TextField
								name="email"
								label="Email:"
								value={this.props.authStore.values.email}
								fullWidth={true}
								variant="outlined"
								type="text"
								onChange={this.handleEmailChange}
								error={!!errors?.email} />
						</FormControl>
						<FormControl className="login__form-control">
							<TextField
								name="password"
								label="Password:"
								value={this.props.authStore.values.password}
								fullWidth={true}
								variant="outlined"
								type="password"
								onChange={this.handlePasswordChange}
								error={!!errors?.password} />
						</FormControl>
						<FormControl error={!!serviceMessage.length} className="login__serviceContainer">
							{this.props.authStore.inProgress && <Bayan/>}
							<FormHelperText>{serviceMessage}</FormHelperText>
						</FormControl>
						<FormControl>
							<Button variant="contained" color="secondary" fullWidth type="submit"
                                disabled={this.props.authStore.inProgress}>Login
                            </Button>
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
