import React from 'react';
import authApi from '../../services/authApi'
import { inject } from 'mobx-react';
import Link from '@material-ui/core/Link';
import { Redirect } from 'react-router-dom';

@inject('appStore')
@inject('userStore')
class LogoutLink extends React.Component {
    state = { redirect: false };
	doLogout() {
        authApi.logout().finally(() => {
            this.props.userStore.setUser(undefined);
            this.props.appStore.unsetToken();
            this.setState({ redirect: true });
        });
	}
	render() {
        console.log('LogoutLink render', this.props.userStore.isLoggedIn, this.state.redirect);
        if (this.props.userStore.isLoggedIn) {
            if (this.state.redirect) {
                return <Redirect to='/login'/>
            }
            return (
                <Link href="#" onClick={this.doLogout.bind(this)}>Logout</Link>
            );
        }
	}
}

export default LogoutLink;
