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
					<div>
					{this.props.message && (
						<p className="serverError__info">{this.props.message}</p>
					)}
					<Button variant="contained" type="button" color="secondary" onClick={this.reloadWindow}>reload</Button>
					</div>
				</center>
			</div>
		);
	}
}