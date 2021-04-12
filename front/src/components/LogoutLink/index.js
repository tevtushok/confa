import React from 'react';
import authApi from '../../services/authApi'
import { inject } from 'mobx-react';
import Link from '@material-ui/core/Link'

@inject('userStore')
class LogoutLink extends React.Component {
	async doLogout() {
		authApi.logout();
		this.props.userStore.unsetUser();
	}
	render() {
		return (
			<Link href="#" onClick={this.doLogout.bind(this)}>Logout</Link>
		);
	}
}

export default LogoutLink;
