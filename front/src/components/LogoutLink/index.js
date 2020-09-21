import React from 'react';
import { logoutAuthService } from '../../services/auth'
import { inject } from 'mobx-react';

@inject('userStore')
class LogoutLink extends React.Component {
	async doLogout() {
		await logoutAuthService();
		this.props.userStore.unsetUser();
	}
	render() {
		return (
			<a href="#" onClick={this.doLogout.bind(this)}>Logout</a>
		);
	}
}

export default LogoutLink;