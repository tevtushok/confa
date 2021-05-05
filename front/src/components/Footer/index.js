import React from 'react';
import { AppBar, Toolbar, Link } from '@material-ui/core';

import './index.scss';

class Footer extends React.Component {
	render() {
		return (
            <footer>
                <AppBar position="static" color="default">
                    <Toolbar className="footer" color="default">
                        <div>
                            Based on <Link href="https://reactjs.org">React</Link><span> {React.version} </span>
                        </div>
                    </Toolbar>
                </AppBar>
            </footer>
		);
	}
}

export default Footer;
