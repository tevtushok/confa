import React from 'react';
import Button from '@material-ui/core/Button'

import './index.scss'

export default class ServerError extends React.Component {

	reloadWindow() {
		window.location.reload();
	}
	render() {
		return (
			<div className="serverError page">
				<center>
					<h2>Hmm. We’re having trouble loading that application</h2>
					<Button variant="contained" type="button" color="secondary" onClick={this.reloadWindow}>reload</Button>
				</center>
			</div>
		);
	}
}
