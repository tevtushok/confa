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

		this.inputTimeoutx = null;
		this.inputSavingDelay = 300;
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
			status: 0,
			// isNew nean room not yet stored in database
			isNew: true
		}
	}
	getRequiredFields() {
		return Object.keys(this.fields).filter(field => true === this.fields[field].required);
	}

	async componentDidMount() {
		this.setState({isLoading: true});
		const result = await getRoomsApi();
		this.setState({isLoading: false, isLoaded: true});
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

		const status = room.status === 1 ? 0 : 1;
		room['status'] = status;
		let res = false;
		if (room.isNew) {
			try {
				const createRes = await this.createNewRoom(room, {status: status});
			}
			catch (err) {
				console.error('toggleStatusHandler->createNewRoom', err)
			}
			
		}
		else {
			try{
				const updateRes = await this.updateRoom(room, {status: status});
			}
			catch (err) {
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
		const validationRes = validateInputFields(fieldName, data);
		if (true !== validationRes) {
			room.errors = validationRes;
			return false;
		}
		room[fieldName] = value;
		clearTimeout(this.inputTimeoutx);
		if (!room) {
			console.err('updateRoomHandler nothing to save');
			return;
		}
		this.inputTimeoutx = setTimeout(async () => {
			if (room.isNew) {
				try{
					const createResp = await this.createNewRoom(room);
				}
				catch(err) {
					console.log('updateRoomHandler-> createNewRoom', err)
				}
			}
			else {
				
				try{
					const updateResp = await this.updateRoom(room, data);
				}
				catch(err) {
					console.log('updateRoomHandler-> updateRoom', err)
				}
			}
			
		}, this.inputSavingDelay);
		
	}

	async addRoomHandler() {
		const rooms = this.state.roomList.rooms;
		rooms.push(this.getNewRoomSceleton());
		this.setState({roomList: {rooms: rooms}})
	}

	async removeRoomHandler(roomId) {
		const rooms = this.state.roomList.rooms;
		let needleRoomIndex = false;
		for (let i = 0; i < rooms.length; i++) {
			if (roomId === rooms[i]['_id']) {
				needleRoomIndex = i;
				break;
			}
		}
		if (!needleRoomIndex) {
			console.error('Nothing to delete');
			return;
		}
		const room = rooms[needleRoomIndex];

		const deletedResp = this.deleteRoom(room);
		this.setState({roomList: {rooms: rooms}});
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
			throw new Error('this room in database')
		}
		const requiredFields = this.getRequiredFields();
		const validationRes = validateInputFields(requiredFields);
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
		}
		return room;
	}

	render() {
		return (
			<Container maxWidth="md">
			<div className="component rooms">
			{true === this.state.isLoading && <div className="rooms__isLoading"><CircularProgress className="" color="secondary" /></div> }
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
			{this.state.isLoaded && (
				<FormControl>
				<Button onClick={this.addRoomHandler} variant="contained" color="secondary" fullWidth type="button" disabled={this.state.isLoading}>New room</Button>
				</FormControl>
				)}
			</div>
			</Container>
			);
	}
}

export default adminRooms;