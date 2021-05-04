import React from 'react';
import Toolbar from '@material-ui/core/Toolbar'
import Link from "@material-ui/core/Link";

import './index.scss';

class Footer extends React.Component {
	render() {
		return (
			<footer>
				<Toolbar className="footer" color="default">
					<div>
                        Based on <Link href="https://reactjs.org">React</Link><span> {React.version} </span>
                    </div>
				</Toolbar>
			</footer>
		);
	}
}

export default Footer;
