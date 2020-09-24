import React from 'react';
import {
	Container,
	Button,
	IconButton,
	TextField,
	CircularProgress
} from '@material-ui/core';

import {
	Delete as DeleteIcon,
	LockOutlined as LockIcon,
	LockOpenOutlined as LockOpenIcon,
} from '@material-ui/icons';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import { getRooms, saveRooms, deleteRoom } from '../../../services/admin/rooms'

import './index.scss';

class adminRooms extends React.Component {
	constructor(props) {
		super(props);
		this.saveRoomsHandler = this.saveRoomsHandler.bind(this);
		this.addRoomHandler = this.addRoomHandler.bind(this);
		this.removeRoomHandler = this.removeRoomHandler.bind(this);
		this.toggleStatusHandler = this.toggleStatusHandler.bind(this);

		this.state = {
			roomList: {
				page: 1,
				rooms: []
			},
			isLoading: false,
			errorMessage: '',
		};
	}
	async componentDidMount() {
		const result = await getRooms();
		const rooms = result.data?.data?.rooms ? result.data.data.rooms : undefined;
		if (result.error || !(Array.isArray(rooms))) {
			this.setState({errorMessage: 'Data loading failure'})
		}
		else {
			this.setState({
				errorMessage: '',
				roomList:{rooms: rooms}
			});
		}
	}

	toggleStatusHandler(roomId) {
		let rooms = this.state.roomList.rooms;
		let updatedRooms = rooms.map(room => {
			if (room._id === roomId) {
				room.status = room.status === 1 ? 0 : 1;
				room.isChanged = true;
			}
			return room;
		});
		this.setState({roomList: {rooms: updatedRooms}});
	}

	async updateRoomHandler(e, roomId) {
		const fieldName = e.target.name;
		if (fieldName === 'number' || fieldName === 'title') {
			const value = e.target.value;
			let roomToSave = false;
			let roomToSaveIndex = false;
			let updatedRooms = this.state.roomList.rooms.map((room, index) => {
				if (room._id === roomId) {
					room[fieldName] = value;
					room.isChanged = true;
					roomToSave = room;
					roomToSaveIndex = index;
				}
				return room;
			});
			if (roomToSave) {
				let postRoom = {};
				postRoom[fieldName] = value;
				if (!('isNew' in roomToSave)) {
					postRoom._id = roomToSave._id;
				}
				const result = await saveRooms(postRoom);
				if (result.error) {
					if (1102 === result.response.data.code) {
						const fields = Object.keys(result.response.data.data.fields);
						if (!('errors' in roomToSave)) {
							roomToSave.errors = {};
						}
						fields.forEach(field => roomToSave['errors'][field] = true)
					}
				}
				
				if ('isNew' in roomToSave) {
					// lets update room with new id from dabase
					//console.log(roomToSaveIndex);
					//delete updatedRooms[roomToSaveIndex];
					//updatedRooms[roomToSaveIndex]._id = result.data.data._id;
				}
			}
			this.setState({roomList: {rooms: updatedRooms}});
		}
	}

	async addRoomHandler() {
		const rooms = this.state.roomList.rooms;
		rooms.push({
			_id: rooms.length,
			number: '',
			title: '',
			status: 0,
			// _isNew only client side key
			isNew: true
		});
		this.setState({roomList: {rooms: rooms}})
	}

	async removeRoomHandler(roomId) {
		const rooms = this.state.roomList.rooms;
		let itemToDelete = false;
		const roomsFiltered = rooms.filter((room) => {
			const isNeedle = room._id === roomId;
			if (isNeedle) {
				itemToDelete = room;
			}
			return !isNeedle;
		});
		// deleteRoom
		console.log('removeRoomHandler', itemToDelete)
		if (itemToDelete && !('isNew' in itemToDelete)) {
			console.log('removeRoomHandlerremoveRoomHandlerremoveRoomHandler')
			this.setState({isLoading: true})
			const deleted = await deleteRoom(itemToDelete._id);
			this.setState({isLoading: false})

			const errorMessage = 'error' in deleted ? 'Server Failure while removing' : '';
			this.setState({errorMessage: errorMessage})
		}

		this.setState({roomList: {rooms: roomsFiltered}});
	}

	async saveRoomsHandler(e) {
		console.log(e);
		e.preventDefault();
		const editedRooms = this.state.roomList.rooms.filter((room) => room.isNew || room.isChanged);
		const result = await getRooms();
		const savedRooms = result.data?.data?.rooms ? result.data.data.rooms : undefined;
		if (result.error) {
			this.setState({errorMessage: 'Data save failure'})
		}
		if (Array.isArray(savedRooms)) {
			console.log(savedRooms)
		}
	}

	render() {
		return (
			<Container maxWidth="md">
			{true === this.state.isLoading && <CircularProgress color="secondary" /> }
				<div className="component rooms">
					<h2>Rooms Settings</h2>
					<form onSubmit={this.saveRoomsHandler}>
						<TableContainer component={Paper} className="rooms__listRoom">
							<Table aria-label="rooms">
								<TableHead>
									<TableRow>
										<TableCell aria-label="Number">Number</TableCell>
										<TableCell aria-label="Title">Title</TableCell>
										<TableCell aria-label="Status">Status</TableCell>
										<TableCell aria-label=""></TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{this.state.roomList.rooms.map((room, index) => (
										<TableRow key={room._id}>
											<TableCell>
												<TextField
													name="number"
													type="text"
													error={!!room?.errors?.number}
													fullWidth={true}
													label="Number:"
													variant="outlined"
													onChange={(e) => this.updateRoomHandler(e, room._id)}
													defaultValue={room.number}/>
											</TableCell>
											<TableCell>
												<TextField
													name="title"
													type="text"
													fullWidth={true}
													error={!!room?.errors?.title}
													variant="outlined"
													label="Title:"
													onChange={(e) => this.updateRoomHandler(e, room._id)}
													defaultValue={room.title}/>
											</TableCell>
											<TableCell>
												{1 === room.status && (
													<IconButton onClick={() => this.toggleStatusHandler(room._id)} edge="end" aria-label="lock">
														<LockOpenIcon />
													</IconButton>
												)}
												{1 !== room.status && (
													<IconButton onClick={() => this.toggleStatusHandler(room._id)} edge="end" aria-label="unlock">
														<LockIcon />
													</IconButton>
												)}
						                  	</TableCell>
						                  	<TableCell align="right">
						                  		<IconButton onClick={() => this.removeRoomHandler(room._id)} edge="end" aria-label="delete">
													<DeleteIcon />
												</IconButton>
						                  	</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
						<Button onClick={this.addRoomHandler} variant="contained" color="primary">New room</Button>
						<Button variant="contained" type="submit" color="secondary">Save</Button>
					</form>
				</div>
			</Container>
		);
	}
}

export default adminRooms;