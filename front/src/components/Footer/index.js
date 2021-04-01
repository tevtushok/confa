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
					<div>
                        Based on <Link href="https://reactjs.org">React</Link>{React.version}
                    </div>
				</Toolbar>
			</footer>
		);
	}
}

export default Footer;
