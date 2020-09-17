import React from 'react';
import { Button } from 'react-bootstrap';

class LogoutButton extends React.Component {
	doLogout() {
		console.log('doloout')
	}
	render() {
		return (
			<Button variant="link" onClick={this.doLogout.bind(this)}>logout</Button>
		);
	}
}

export default LogoutButton;