import React from 'react';

import { getRooms } from '../../../services/admin/rooms'

//import './index.scss';

class adminRooms extends React.Component {
	async componentDidMount() {
		const rooms = await getRooms();
		console.log(rooms)
	}

	render() {
		return (
			<div className="component rooms">
				Rooms
			</div>
		);
	}
}

export default adminRooms;