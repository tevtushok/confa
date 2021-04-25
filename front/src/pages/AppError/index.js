import React from 'react';
import Button from '@material-ui/core/Button'

import './index.scss'

export default class AppError extends React.Component {

	reloadWindow() {
		window.location.reload();
	}
	render() {
		return (
			<div className="appError page">
				<center>
                    <h2 className="error">Something went wrong.</h2>
					<Button variant="contained" type="button" color="secondary" onClick={this.reloadWindow}>reload</Button>
				</center>
			</div>
		);
	}
}
