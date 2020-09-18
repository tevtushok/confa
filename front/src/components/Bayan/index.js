import React from 'react';
import './index.css'

class Bayan extends React.Component {
	constructor(props) {
		super(props);
		this.backgroundColor = this.props.backgroundColor || 'inherit';
		this.color = this.props.color || 'inherit';
	}
	render() {
		const containerStyle = {
			backgroundColor: this.backgroundColor
		}
		const dottStyle = {
			color: this.color
		}
		return (
			<div class="bayan" style={containerStyle}>
				<div style={dottStyle}>&middot;</div>
				<div style={dottStyle}>&middot;</div>
				<div style={dottStyle}>&middot;</div>
			</div>
		);
	}
}

export default Bayan;