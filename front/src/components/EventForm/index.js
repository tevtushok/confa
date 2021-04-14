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
                        <MenuItem key={room['_id']} value={room['_id']}>{room.number}</MenuItem>
                    ))}
                    </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={4}>
                <FormControl error={!!this.props.errors && !!this.props.errors.date_start}>
                    <FormHelperText>Start Date time</FormHelperText>
                    <MuiPickersUtilsProvider utils={DateUtils}>
                        <DateTimePicker
                            value={this.props.event.date_start}
                            disablePast
                            ampm={false}
                            minutesStep={5}
                            onChange={this.props.handleStartDateTimeChange} />
                    </MuiPickersUtilsProvider>
                </FormControl>
                </Grid>
                <Grid item xs={4}>
                    <FormControl error={!!this.props.errors && !!this.props.errors.date_end}>
                        <FormHelperText>Duration in minutes</FormHelperText>
                        <TextField inputProps={{ min: "10", step: "10" }}
                            type="number" value={this.props.event.duration}
                            onChange={this.props.handleDurationChange}/>
                    </FormControl>
                </Grid>
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
                <Grid item xs={12}>
                {this.props.alert &&(
                        <Alert severity={this.props.alert.severity}>
                            {this.props.alert.message}
                        </Alert>
                )}
                </Grid>
                {this.props.serviceMessage &&(
                    <Grid item xs={12}>
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
                <Grid item xs={12} className="btnContainer">
                    <Button disabled={this.props.isLoading} className="submit" variant="contained" fullWidth
                        type="button" color="secondary" onClick={this.props.handleSubmit}>{this.props.action}
                    </Button>
                </Grid>
            {this.props.isLoading && <Bayan/>}
            </Grid>
        );
    }
}
