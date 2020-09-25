import React from 'react';
import {
	Container,
	Button,
	IconButton,
	TextField,
	CircularProgress,
	FormControl,
} from '@material-ui/core';

import {
	Delete as DeleteIcon,
	LockOutlined as LockIcon,
	LockOpenOutlined as LockOpenIcon,
	Save as SaveIcon,
} from '@material-ui/icons';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import {
	getRooms as getRoomsApi,
	saveRooms as saveRoomsApi,
	deleteRoom as deleteRoomApi
} from '../../../services/admin/rooms'

import './index.scss';

class adminRooms extends React.Component {
	constructor(props) {
		super(props);
		this.saveRoomHandler = this.saveRoomHandler.bind(this);
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

	getNewRoomSceleton() {
		const rooms = this.state.roomList.rooms;
		return {
			_id: rooms.length,
			number: '',
			title: '',
			status: 0,
			// isNew nean room not yet stored in database
			isNew: true
		}
	}

	async componentDidMount() {
		const result = await getRoomsApi();
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
		let room = rooms.find(room => room._id === roomId)

		if (room) {
			const status = room.status === 1 ? 0 : 1;
			const dbSave = room.isNew ? false : true;
			this.saveRoom(roomId, {status: status}, dbSave);
		}
	}
	async saveRoom (roomId = false, data = false, dbSave = false) {
		if (!roomId || !data || Object !== data.constructor) {
			return;
		};
		if ('_id' in data) {
			delete data._id;
		}
		const keys = Object.keys(data);
		if (keys.length === 0) {
			return;
		}

		const rooms = this.state.roomList.rooms;
		const room = rooms.find((room) => roomId === room._id);
		const postRoom = {};
		if (!room) return;
		keys.forEach(key => {
			if (key in room) {
				postRoom[key] = data[key];
			}
		});
		if (Object.keys(postRoom)) {
			room.errors = {};
			this.isChanged = true;
			Object.assign(room, postRoom);
			if (!room.isNew) {
				postRoom._id = room._id;
			}
			if (dbSave) {
				const result = await saveRoomsApi(postRoom);
				if (result.errors) {
					const errorFields = result.response.data.data?.fields;
					console.log('fffffffffffffffff')
						console.info(errorFields)
					if (errorFields && 'object' === typeof errorFields) {
						console.log('fffffffffffffffff')
						console.info(errorFields)
						const fields = Object.keys(result.response.data.data.fields);
						fields.forEach(field => room.errors[field] = true)
					}
				}
				else {
					if (room.isNew) {
						const newId = result.data.data?.room._id;
						room._id = newId;
						delete room.isNew;
					}
				}
			}
			this.setState({roomList: {rooms: rooms}});
		}
		
	}
	async updateRoomHandler(e, roomId) {
		const fieldName = e.target.name;
		if (fieldName === 'number' || fieldName === 'title') {
			const value = e.target.value;
			const data = {[fieldName]: value};
			this.saveRoom(roomId, data, true);
		}

	}

	async addRoomHandler() {
		const rooms = this.state.roomList.rooms;
		rooms.push(this.getNewRoomSceleton());
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
			const deleted = await deleteRoomApi(itemToDelete._id);
			this.setState({isLoading: false})

			const errorMessage = 'error' in deleted ? 'Server Failure while removing' : '';
			this.setState({errorMessage: errorMessage})
		}

		this.setState({roomList: {rooms: roomsFiltered}});
	}

	async saveRoomHandler(roomId) {
		const rooms = this.state.roomList.rooms;
		const room = rooms.find(room => room._id === roomId);
		if (room) {
			let postRoom = {};
			postRoom.title = room.title;
			postRoom.number = room.number;
			this.saveRoom(roomId, postRoom, true);
		}
	}

	render() {
		return (
			<Container maxWidth="md">
			{true === this.state.isLoading && <CircularProgress color="secondary" /> }
				<div className="component rooms">
					<h2>Rooms Settings</h2>
						<TableContainer component={Paper} className="rooms__listRoom">
							<Table aria-label="rooms">
								<TableHead>
									<TableRow>
										<TableCell aria-label="Number" className="rooms__cellNumber">Number</TableCell>
										<TableCell aria-label="Title">Title</TableCell>
										<TableCell aria-label="Status">Status</TableCell>
										<TableCell aria-label="" className="rooms__cellActions"></TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{this.state.roomList.rooms.map((room, index) => (
										<TableRow key={room._id}>
											<TableCell className="rooms__cellNumber">
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
											<TableCell className="rooms__cellActions">
											<div className="rooms__actionsContainer">
												{1 === room.status && (
													<IconButton onClick={(e) => this.toggleStatusHandler(room._id)} edge="end" aria-label="lock">
														<LockOpenIcon />
													</IconButton>
												)}
												{1 !== room.status && (
													<IconButton onClick={(e) => this.toggleStatusHandler(room._id)} edge="end" aria-label="unlock">
														<LockIcon />
													</IconButton>
												)}
												{'isNew' in room && (
														
													<IconButton onClick={() => this.saveRoomHandler(room._id)} edge="end" aria-label="save">
														<SaveIcon />
													</IconButton>
												)}
												</div>
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
						<FormControl>
                        	<Button onClick={this.addRoomHandler} variant="contained" color="secondary" fullWidth type="button" disabled={this.state.isLoading}>New room</Button>
                    	</FormControl>
				</div>
			</Container>
		);
	}
}

export default adminRooms;