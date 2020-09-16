import React from 'react';
import { Link } from "react-router-dom";

import './index.scss';

class Footer extends React.Component {
	render() {
		return (
			<footer>
				<div className="footer">
					<Link to="/login"><div>login</div></Link>
					<Link to="/register"><div>register</div></Link>
					<Link to="/Profile"><div>profile</div></Link>
				</div>
			</footer>
		);
	}
}

export default Footer;