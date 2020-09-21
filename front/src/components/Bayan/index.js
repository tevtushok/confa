import React from 'react';
import './index.css'

class Bayan extends React.Component {
	constructor(props) {
		super(props);
		this.backgroundColor = this.props.backgroundColor || 'inherit';
		this.color = this.props.color || 'inherit';
	}
	render() {
		const bayanStyle = {
			backgroundColor: this.backgroundColor,
			color: this.color
		}
		return (
			<div class="bayan" style={bayanStyle}>
				<div>&middot;</div>
				<div>&middot;</div>
				<div>&middot;</div>
			</div>
		);
	}
}

export default Bayan;
