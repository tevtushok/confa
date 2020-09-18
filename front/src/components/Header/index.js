import React from 'react';
import { Link } from "react-router-dom";
import { inject } from 'mobx-react';
import LogoutLink from '../LogoutLink'

import './index.scss';



@inject("userStore")
class Header extends React.Component {
	render() {
		const user = JSON.stringify(this.props.userStore.user);
		const isLoggedIn = this.props.userStore.isLoggedIn;
		console.log(user);
		return (
			<header>
				<div className="header">
					<div className="flex">
						<LogoutLink/>
						<Link to="/login"><div>login</div></Link>
						<Link to="/register"><div>register</div></Link>
						<Link to="/schedule"><div>schedule</div></Link>
						<Link to="/Profile"><div>profile</div></Link>
					</div>
					<div>
						isLoggedIn: {isLoggedIn}
					</div>
					<div> |user: {user}</div>
				</div>
			</header>
		);
	}
}

export default Header;