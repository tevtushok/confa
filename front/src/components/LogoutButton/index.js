import React from 'react';

class LogoutButton extends React.Component {
	render() {
		return (
			<button
				className='submit'
				onClick = { () => this.props.onClick() }
			>
			logout</button>
			);
	}
}

export default LogoutButton;