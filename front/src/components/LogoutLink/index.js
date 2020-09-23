import React from 'react';
import { logoutAuthService } from '../../services/auth'
import { inject } from 'mobx-react';
import Link from '@material-ui/core/Link'

@inject('userStore')
class LogoutLink extends React.Component {
	async doLogout() {
		await logoutAuthService();
		this.props.userStore.unsetUser();
	}
	render() {
		return (
			<Link href="#" onClick={this.doLogout.bind(this)}>Logout</Link>
		);
	}
}

export default LogoutLink;