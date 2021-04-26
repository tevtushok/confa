import React from 'react';
import authApi from '../../services/authApi'
import { inject } from 'mobx-react';
import Link from '@material-ui/core/Link';

@inject('appStore')
@inject('userStore')
class LogoutLink extends React.Component {
	doLogout() {
        authApi.logout().finally(() => {
            this.props.userStore.setUser(undefined);
            this.props.appStore.unsetToken();
        });
	}
	render() {
        console.log('LogoutLink render', this.props.userStore.isLoggedIn);
        if (this.props.userStore.isLoggedIn) {
            return (
                <Link href="#" onClick={this.doLogout.bind(this)}>Logout</Link>
            );
        }
        return '';
	}
}

export default LogoutLink;
