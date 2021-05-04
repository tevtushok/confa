import React from 'react';
import dayjs from 'dayjs';
import DateUtils from '@date-io/dayjs';
import { Link as routerLink } from 'react-router-dom';
import {
    FormControl,
    Select,
    TextField,
    MenuItem,
    FormHelperText,
    Button,
    Grid,
    Link,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import {
    DateTimePicker,
    KeyboardTimePicker,
    MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import Bayan from '../../components/Bayan'

import './index.scss';

export default class EventForm extends React.Component {
    constructor(props) {
        super(props);
        this.submitBtnText = this.props.action;
    }
    render() {
        console.info('EventForm render');
        console.log(this.props);
        console.log('roomId', this.props.event.room._id);

        return (
            <Grid container spacing={3} className="eventForm">
                <Grid item xs={4}>
                    <FormControl fullWidth error={!!this.props.errors && !!this.props.errors.room}>
                    <FormHelperText>Rooms list</FormHelperText>
                    <Select
                        onChange={this.props.handleRoomChange}
                        value={this.props.event.room._id}
                    >
                    {Array.isArray(this.props.roomsList) && this.props.roomsList.map((room, index) => (
                        <MenuItem key={room._id} value={room._id}>{room.number}</MenuItem>
                    ))}
                    </Select>
                    </FormControl>
                </Grid>
                <MuiPickersUtilsProvider utils={DateUtils}>
                <Grid item xs={4}>
                <FormControl error={!!this.props.errors && !!this.props.errors.date_start}>
                    <FormHelperText>Start time</FormHelperText>
                        <DateTimePicker
                            value={this.props.event.date_start}
                            ampm={false}
                            minutesStep={5}
                            onChange={this.props.handleDateStartChange} />
                </FormControl>
                </Grid>
                <Grid item xs={4}>
                    <FormControl error={!!this.props.errors && !!this.props.errors.date_end}>
                        <FormHelperText>Time end</FormHelperText>
                        <KeyboardTimePicker
                            value={this.props.event.date_end}
                            onChange={this.props.handleDateEndChange}
                            minutesStep={5}
                            ampm={false}
                        />
                    </FormControl>
                </Grid>
                </MuiPickersUtilsProvider>
                <Grid item xs={4}>
                    <FormControl error={!!this.props.errors && !!this.props.errors.title}>
                        <FormHelperText>Title</FormHelperText>
                        <TextField value={this.props.event.title} onChange={this.props.handleTitleChange}/>
                    </FormControl>
                </Grid>
                <Grid item xs={8}>
                    <FormControl fullWidth error={!!this.props.errors && !!this.props.errors.description}>
                        <FormHelperText>Description</FormHelperText>
                        <TextField multiline fullWidth value={this.props.event.description} onChange={this.props.handleDescriptionChange}/>
                    </FormControl>
                </Grid>
                {this.props.alert &&(
                <Grid item xs={12}>
                        <Alert severity={this.props.alert.severity}>
                            {this.props.alert.message}
                        </Alert>
                </Grid>
                )}
                {this.props.serviceMessage &&(
                    <Grid item className="qq" xs={12}>
                        <Alert severity="error">
                            <div>{this.props.serviceMessage}</div>
                                {Array.isArray(this.props.crossedEvents) && this.props.crossedEvents.map((event, index) => (
                                    <div className="crossedEvents" key={index}>
                                        {dayjs(event.date_start).format('DD-MM-YY HH:mm')}
                                        -{dayjs(event.date_end).format('HH:mm')}
                                        &nbsp; reserved by <Link component={routerLink} variant="inherit" to={`/@${event.user.name}`}>{event.user.name}</Link>
                                    </div>
                                ))}
                        </Alert>
                    </Grid>
                )}
                <Grid item xs={12} className="bayanNearButton">
                    {this.props.isLoading && <Bayan/>}
                </Grid>
                <Grid item xs={12} className="btnContainer">
                    <Button disabled={this.props.isLoading} className="submit" variant="contained" fullWidth
                        type="button" color="primary" onClick={this.props.handleSubmit}>{this.props.action}
                    </Button>
                </Grid>
            </Grid>
        );
    }
}
