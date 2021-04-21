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
                    <div className="error">{this.props.message}</div>
					<Button variant="contained" type="button" color="secondary" onClick={this.reloadWindow}>reload</Button>
				</center>
			</div>
		);
	}
}
