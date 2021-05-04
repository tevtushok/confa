import React from 'react';
import { Link as RouterLink } from "react-router-dom";
import { inject } from 'mobx-react';
import LogoutLink from '../LogoutLink'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Link from "@material-ui/core/Link";

import './index.scss';



@inject("userStore")
class Header extends React.Component {
	render() {
		const userStore = this.props.userStore;
		if (userStore.user) {
			let admin_links = '';
			if (userStore.user.isAdmin) {
				admin_links = <Link component={RouterLink} to="/rooms">Rooms</Link>
			}
			return (
				<AppBar position="static" color="default">
					<Toolbar>
						<LogoutLink/>
						{admin_links}
						<Link component={RouterLink} to="/events">Events</Link>
						<Link component={RouterLink} to={`/@${userStore.user.name}`}>Profile</Link>
					</Toolbar>
				</AppBar>
			);
		}
		else {
			return (
				<AppBar position="static" color="default">
					<Toolbar>
						<Link component={RouterLink} to="/login">Login</Link>
						<Link component={RouterLink} to="/register">Register</Link>
					</Toolbar>
				</AppBar>
			);
		}
	}
}

export default Header;
