import React from 'react';
import { Link } from "react-router-dom";
import { inject } from 'mobx-react';
import LogoutButton from '../LogoutButton'

import './index.scss';



@inject("userStore")
class Header extends React.Component {
	render() {
		const isLoggedIn = this.props.userStore.isLoggedIn
		return (
			<header>
				<div className="header">
					<div className="flex">
							<LogoutButton/>
						{!isLoggedIn && (
							<Link to="/login"><div>login</div></Link>
						)}
						<Link to="/register"><div>register</div></Link>
						<Link to="/schedule"><div>schedule</div></Link>
						<Link to="/Profile"><div>profile</div></Link>
					</div>
					<div>
						isLoggedIn: {isLoggedIn}
					</div>
				</div>
			</header>
		);
	}
}

export default Header;