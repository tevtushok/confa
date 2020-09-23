import React from 'react';
import { Link as RouterLink } from "react-router-dom";
import Toolbar from '@material-ui/core/Toolbar'
import Link from "@material-ui/core/Link";

import './index.scss';

class Footer extends React.Component {
	render() {
		return (
			<footer>
				<Toolbar className="footer">
					<Link component={RouterLink} to="/login"><div>Login</div></Link>
					<Link component={RouterLink} to="/register"><div>register</div></Link>
				</Toolbar>
			</footer>
		);
	}
}

export default Footer;