import React from 'react';
import Button from '@material-ui/core/Button'

import './index.scss'

export default class Offline extends React.Component {

	reloadWindow() {
		window.location.reload();
	}
	render() {
		return (
			<div className="offline page">
				<center>
                    <div className="error">No internet connection</div>
					<Button variant="contained" type="button" color="secondary" onClick={this.reloadWindow}>reload</Button>
				</center>
			</div>
		);
	}
}
