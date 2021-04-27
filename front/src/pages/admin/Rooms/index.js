import React from 'react';
import {
	Container,
	Button,
	IconButton,
	TextField,
	CircularProgress,
	FormControl,
} from '@material-ui/core';

import Alert from '@material-ui/lab/Alert';

// import {
// 	Delete as DeleteIcon,
// 	LockOutlined as LockIcon,
// 	LockOpenOutlined as LockOpenIcon,
// 	Refresh as RefreshIcon
// } from '@material-ui/icons';
//

const DeleteIcon = () => 'D';
const LockIcon = () => 'L';
const LockOpenIcon = () => 'LO';
const RefreshIcon = () => 'R';


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
	deleteRoom as deleteRoomApi,
	validateInputFields,
} from '../../../services/admin/rooms'

import './index.scss';

class adminRooms extends React.Component {
	constructor(props) {
		super(props);
		this.addRoomHandler = this.addRoomHandler.bind(this);
		this.removeRoomHandler = this.removeRoomHandler.bind(this);
		this.toggleStatusHandler = this.toggleStatusHandler.bind(this);
		this.loadRooms = this.loadRooms.bind(this);

		this.inputTimeoutx = null;
		this.inputSavingDelay = 500;
		this.fields = {
			number: {
				required: true,
				text: 'Number',
			},
			title: {
				required: true,
				text: 'Title'
			},
			status: {
				text: 'Status'
			}
		}

		this.state = {
			roomList: {
				page: 1,
				rooms: []
			},
			isLoading: false,
			isLoaded: false,
			errorMessage: '',
		};
	}
	getNewRoomSceleton() {
		const rooms = this.state.roomList.rooms;
		return {
			_id: rooms.length,
			number: '',
			title: '',
			status: 'CLOSED',
			// isNew nean room not yet stored in database
			isNew: true
		}
	}
	getRequiredFields() {
		return Object.keys(this.fields).filter(field => true === this.fields[field].required);
	}

	scrollTop() {
    	const element = document.querySelector('.rooms')
    	if (element) {
    		element.scrollIntoView({behavior: "smooth"});
    	}
	}

	setErrorMessage(msg, scroll = true) {
		this.setState({errorMessage: msg});
		if (scroll) {
			this.scrollTop();
		}
	}

	async componentDidMount() {
		await this.loadRooms();
	}

	async loadRooms() {
		this.setState({isLoading: true});
		const result = await getRoomsApi();
		this.setState({isLoading: false, isLoaded: true});
		const rooms = result.data?.data?.rooms ? result.data.data.rooms : [];
		if (result.error || !(Array.isArray(rooms))) {
			const errorMessage = 'Data loading failure';
			this.setErrorMessage(errorMessage);
			return false;
		}
		this.setState({
			errorMessage: '',
			roomList:{rooms: rooms}
		});
	}

	async toggleStatusHandler(roomId) {
		if (!roomId) {
			console.error('roomId is required');
			return;
		}
		let rooms = this.state.roomList.rooms;
		let room = rooms.find(room => room._id === roomId);

		if (!room) {
			console.error(`Room with id:${roomId} doesn't exist`);
			return;
		}

		const status = room.status === 'CLOSED' ? 'ACTIVE' : 'CLOSED';
		room['status'] = status;
		if (room.isNew) {
			try {
				await this.createNewRoom(room, {status: status});
			}
			catch (err) {
				console.error('toggleStatusHandler->createNewRoom', err)
				this.setErrorMessage(err.message)
			}

		}
		else {
			try{
				await this.updateRoom(room, {status: status});
			}
			catch (err) {
				this.setErrorMessage(err.message)
				console.error('toggleStatusHandler->updateRoom', err)
			}
		}
		this.setState({roomList: {rooms: rooms}})
	}

	async updateRoomHandler(e, roomId) {
		const fieldName = e.target.name;
		if (!['number', 'title'].includes(fieldName)) {
			console.error('invalid target field')
			return;
		}
		const value = e.target.value;
		const data = {[fieldName]: value};
		const rooms = this.state.roomList.rooms;
		const room = rooms.find(room => room._id === roomId);
		room[fieldName] = value;
		clearTimeout(this.inputTimeoutx);
		if (!room) {
			console.err('updateRoomHandler nothing to save');
			return;
		}
		this.inputTimeoutx = setTimeout(async () => {
			if (room.isNew) {
				try{
					await this.createNewRoom(room);
				}
				catch(err) {
					this.setErrorMessage(err.message)
					console.log('updateRoomHandler-> createNewRoom', err)
				}
			}
			else {

				try{
					await this.updateRoom(room, data);
				}
				catch(err) {
					this.setErrorMessage(err.message)
					console.log('updateRoomHandler-> updateRoom', err)
				}
			}
			this.setState({roomList: {rooms: rooms}})

		}, this.inputSavingDelay);

	}

	async addRoomHandler() {
		const rooms = this.state.roomList.rooms;
		rooms.push(this.getNewRoomSceleton());
		this.setState({roomList: {rooms: rooms}})
	}

	async removeRoomHandler(roomId) {
		const rooms = this.state.roomList.rooms;
		let needleRoom = false;
		let roomsFiltered = rooms.filter(room => {
			if (room._id === roomId) {
				needleRoom = room;
				return false;
			}
			return true;
		});

		if (!needleRoom) {
			console.error('Nothing to delete');
			return;
		}

		try {
			const deletedRes = this.deleteRoom(needleRoom);
			if (deletedRes) {
				this.setState({roomList: {rooms: roomsFiltered}});
			}
		}
		catch (err) {
			this.setErrorMessage(err.message)
		}
	}

	async deleteRoom(room) {
		if (room.isNew) {
			return room;
		}
		else {
			const deleteRes = await deleteRoomApi(room._id);
			if (deleteRes.error) {
				// room was delete before from server, need to remove from client
				if (1104 === deleteRes.response.data.code) {
					return room;
				}
				throw new Error('Server Failure while removing');
			}
			else {
				return room;
			}
		}
	}

	async createNewRoom(room) {
		if (!room.isNew) {
			throw new Error('This room in database')
		}
		const requiredFields = this.getRequiredFields();
		room.errors = {}
		const validationRes = validateInputFields(requiredFields, room);
		if (true !== validationRes) {
			room.errors = validationRes;
			return room;
		}
		const postData = {};
		requiredFields.forEach(field => {
			postData[field] = room[field];
		})
		const result = await saveRoomsApi(postData);
		if (result.error) {
			const errorFields = result.response.data.data?.fields;
			if (errorFields && 'object' === typeof errorFields) {
				const fields = Object.keys(errorFields);
				fields.forEach(field => room.errors[field] = true)
			}
		}
		else {
			const newId = result.data.data?.room._id;
			if (newId) {
				room._id = newId;
				delete room.isNew;
			}
			else {
				throw new Error('Missed room id from server response')
			}

		}
		return room;
	}

	async updateRoom(room, data = false) {
		if (room.isNew) {
			throw new Error('This room does not exists in database');
		}
		if ('object' !== typeof data) {
			console.log(data);
			throw new Error('Invalid input data');
		}
		const postData = {_id: room._id};
		const postKeys = Object.keys(data);
		postKeys.forEach(field => {
			if (field in room) {
				postData[field] = data[field];
				room[field] = data[field]
			}
		});
		const validationRes = validateInputFields(Object.keys(postData), postData);
		if (true !== validationRes) {
			room.errors = validationRes;
			return room;
		}
		const result = await saveRoomsApi(postData);
		if (result.error) {
			const respErrorFields = result.response.data.data?.fields;
			if (respErrorFields && 'object' === typeof respErrorFields) {
				const respErrorFieldNames = Object.keys(respErrorFields);
				if (!room.errors) room.errors = {};
				respErrorFieldNames.forEach(field => room.errors[field] = respErrorFields[field])
			}
			// ROOM_NOT_EXISTS
			if (1105 === result.response.data.code) {
				console.error('This room does not exists on database');
				this.setErrorMessage('This room does not exists on database')
				this.setState({isLoading: true});
				setTimeout(() => {
					this.loadRooms();
				}, 2000);
			}
		}
		return room;
	}

	render() {
		return (
			<Container maxWidth="md">

			<div className="component rooms">
			{true === this.state.isLoading && <div className="rooms__isLoading"><CircularProgress className="" color="secondary" /></div> }
			<div className="rooms__header">
				<h2>Rooms Settings</h2>
				<IconButton onClick={this.loadRooms} edge="end" aria-label="unlock">
					<RefreshIcon />
				</IconButton>
			</div>
			<div id="rooms__errorMessage">
				{this.state.errorMessage && (
					<Alert className="rooms__alert" severity="warning">{this.state.errorMessage}</Alert>
				)}
			</div>
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
				disabled={this.state.isLoading}
				name="number"
				type="text"
				error={!!room?.errors?.number}
				fullwidth={true}
				label="Number:"
				variant="outlined"
				onChange={(e) => this.updateRoomHandler(e, room._id)}
				defaultValue={room.number}/>
				</TableCell>
				<TableCell>
				<TextField
				disabled={this.state.isLoading}
				name="title"
				type="text"
				fullwidth={true}
				error={!!room?.errors?.title}
				variant="outlined"
				label="Title:"
				onChange={(e) => this.updateRoomHandler(e, room._id)}
				defaultValue={room.title}/>
				</TableCell>
				<TableCell className="rooms__cellActions">
				<div className="rooms__actionsContainer">
				{'ACTIVE' === room.status && (
					<IconButton
						onClick={(e) => this.toggleStatusHandler(room._id)}
						disabled={this.state.isLoading} edge="end" aria-label="lock">
						<LockOpenIcon />
					</IconButton>
					)}
				{'ACTIVE' !== room.status && (
					<IconButton disabled={this.state.isLoading}
						onClick={(e) => this.toggleStatusHandler(room._id)} edge="end" aria-label="unlock">
						<LockIcon />
					</IconButton>
					)}
				</div>
				</TableCell>
				<TableCell align="right">
				<IconButton disabled={this.state.isLoading}
					onClick={() => this.removeRoomHandler(room._id)} edge="end" aria-label="delete">
					<DeleteIcon />
				</IconButton>
				</TableCell>
				</TableRow>
				))}
			</TableBody>
			</Table>
			</TableContainer>
			{this.state.isLoaded && (
				<FormControl>
				<Button onClick={this.addRoomHandler} variant="contained" color="secondary" fullwidth type="button" disabled={this.state.isLoading}>New room</Button>
				</FormControl>
				)}
			</div>
			</Container>
			);
	}
}

export default adminRooms;
