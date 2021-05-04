import React from 'react';
import { inject, observer } from 'mobx-react';
import {
    Container,
    Button,
    IconButton,
    TextField,
    CircularProgress,
    FormControl,
    FormHelperText,
} from '@material-ui/core';

import Alert from '@material-ui/lab/Alert';

import {
    Delete as DeleteIcon,
    LockOutlined as LockIcon,
    LockOpenOutlined as LockOpenIcon,
    Refresh as RefreshIcon
} from '@material-ui/icons';


import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';


import './index.scss';

@inject('adminRoomsStore')
@observer
class adminRooms extends React.Component {
    constructor(props) {
        super(props);
        this.inputSavingDelay = 500;
        this.inputTimeoutx = undefined;
    }
    scrollTop() {
        const element = document.querySelector('.rooms')
        if (element) {
            element.scrollIntoView({behavior: "smooth"});
        }
    }

    async componentDidMount() {
        this.props.adminRoomsStore.loadRoomList();
    }

    refreshListHandler = () => {
        this.props.adminRoomsStore.loadRoomList();
    }

    toggleStatusHandler = (roomId) => {
        this.props.adminRoomsStore.toggleRoomsStatus(roomId);
    }

    updateRoomHandler = (e, roomId) => {
        clearTimeout(this.inputTimeoutx);
        const fieldName = e.target.name;
        if (!Object.keys(this.props.adminRoomsStore.fields).includes(fieldName)) {
            console.error('invalid target field')
            return;
        }
        const fieldValue = e.target.value;
        if (this.props.adminRoomsStore.setRoomField(roomId, fieldName, fieldValue)) {
            this.inputTimeoutx = setTimeout(() => {
                this.props.adminRoomsStore.updateField(roomId, fieldName, fieldValue);
            }, this.inputSavingDelay);
        }
    }

    addRoomHandler = () => {
        this.props.adminRoomsStore.addFreshRoom();
    }

    removeRoomHandler = (roomId) => {
        this.props.adminRoomsStore.deleteRoom(roomId);
    }

    textFieldFocusHandler = (e) => {
        this.props.adminRoomsStore.saveFocus(e.target);
    }

    render() {
        const isLoading = this.props.adminRoomsStore.isLoading;
        const errorMessage = this.props.adminRoomsStore.errorMessage;
        return (
            <Container maxWidth="md">

                <div className="component rooms">
                    {true === isLoading && <div className="rooms__isLoading"><CircularProgress className="" color="secondary" /></div> }
                    <div className="rooms__header">
                        <h2>Rooms Settings</h2>
                        <IconButton onClick={this.refreshListHandler} edge="end" aria-label="unlock">
                            <RefreshIcon />
                        </IconButton>
                    </div>
                    <div id="rooms__errorMessage">
                        {errorMessage && (
                            <Alert className="rooms__alert" severity="warning">{errorMessage}</Alert>
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
                                {this.props.adminRoomsStore.rooms.map((room, index) => (
                                    <React.Fragment key={room._id}>
                                        <TableRow>
                                            <TableCell className="rooms__cellNumber">
                                                <TextField
                                                    disabled={isLoading}
                                                    name="number"
                                                    type="text"
                                                    error={!!room?.errors?.number}
                                                    fullWidth
                                                    label="#"
                                                    variant="outlined"
                                                    onFocus={this.textFieldFocusHandler}
                                                    onChange={(e) => this.updateRoomHandler(e, room._id)}
                                                    defaultValue={room.number}/>
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    disabled={isLoading}
                                                    name="title"
                                                    type="text"
                                                    fullWidth
                                                    error={!!room?.errors?.title}
                                                    variant="outlined"
                                                    label="Title:"
                                                    onFocus={this.textFieldFocusHandler}
                                                    onChange={(e) => this.updateRoomHandler(e, room._id)}
                                                    defaultValue={room.title}/>
                                            </TableCell>
                                            <TableCell className="rooms__cellActions">
                                                <div className="rooms__actionsContainer">
                                                    {'active' === room.status && (
                                                        <IconButton
                                                            onClick={(e) => this.toggleStatusHandler(room._id)}
                                                            disabled={isLoading} edge="end" aria-label="lock">
                                                            <LockOpenIcon />
                                                        </IconButton>
                                                    )}
                                                    {'active' !== room.status && (
                                                        <IconButton disabled={isLoading}
                                                            onClick={(e) => this.toggleStatusHandler(room._id)} edge="end" aria-label="unlock">
                                                            <LockIcon />
                                                        </IconButton>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton disabled={isLoading}
                                                    onClick={() => this.removeRoomHandler(room._id)} edge="end" aria-label="delete">
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell colSpan={4}>
                                                <FormControl error={true}>
                                                {!!room?.errors?.number && <FormHelperText>Number: {room.errors.number.message}</FormHelperText> }
                                                {!!room?.errors?.title && <FormHelperText>Title: {room.errors.title.message}</FormHelperText> }
                                                </FormControl>
                                            </TableCell>
                                        </TableRow>
                                    </React.Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <FormControl>
                        <Button onClick={this.addRoomHandler}
                            variant="contained" size="large" color="primary"
                            fullWidth type="button" disabled={isLoading}>New room</Button>
                    </FormControl>
                </div>
            </Container>
        );
    }
}

export default adminRooms;
