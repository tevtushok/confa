import React from 'react';
import './index.scss'

class Bayan extends React.Component {
	constructor(props) {
		super(props);
		this.backgroundColor = this.props.backgroundColor || 'inherit';
		this.color = this.props.color || 'inherit';
	}
	render() {
		const bayanStyle = {
			backgroundColor: this.backgroundColor,
			color: this.color,
		}
		return (
			<div className="bayan" style={bayanStyle}>
				<div>&middot;</div>
				<div>&middot;</div>
				<div>&middot;</div>
			</div>
		);
	}
}

export default Bayan;
