import React from 'react';
import { Link as routerLink } from 'react-router-dom';
import dayjs from 'dayjs';
import DateUtils from '@date-io/dayjs';
import {
    FormControl,
    Select,
    TextField,
    MenuItem,
    FormHelperText,
    Button,
    Container,
    Grid,
    Link,
} from '@material-ui/core';
import { Skeleton, Alert } from '@material-ui/lab';
import {
    DateTimePicker,
    MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import roomsApi from '../../services/roomsApi'
import eventsApi from '../../services/eventsApi';
import ApiDataTypeError from '../../services/error';
import CODES from '../../services/codes';
import Bayan from '../../components/Bayan'
import ServiceMessage from '../../components/ServiceMessage'

import './index.scss';

class AddEvent extends React.Component {
    constructor(props) {
        super(props)
        this.defaultStartFrom = new Date();
        this.defaultStartFrom.setMinutes(5 * (Math.round(this.defaultStartFrom.getMinutes() / 5)));
        this.state = {
            roomsList: [],
            eventRoomId: null,
            eventTitle: '',
            eventDescription: '',
            eventStartDateTime: this.defaultStartFrom,
            eventDuration: 30,
            isLoading: false,
            serviceMessage: '',
            noRooms: false,
            createdEvent: null,
            errors: {},
            serverError: null,
            pageLoaded: false,
            crossedEvents: null,
        }

        this.handleStartDateTimeChange = this.handleStartDateTimeChange.bind(this)
        this.handleDurationChange = this.handleDurationChange.bind(this);
        this.handleRoomChange = this.handleRoomChange.bind(this);
        this.handleTitleChange = this.handleTitleChange.bind(this);
        this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
        this.handleAddEvent = this.handleAddEvent.bind(this);
    }

    setLoading(flag) {
        this.setState({isLoading: flag});
    }

    componentDidMount() {
        this.loadRoomList();
    }

    setServerError(message, opts = {}) {
        const defaults = {
            serviceMessage: message,
            serverError: true,
            isLoading: false,
            pageLoaded: true,
        };
        const state = Object.assign(defaults, opts);
        this.setState(state);
    }

    setValidationError(message, errors = {}, opts = {}) {
        const defaults = {
            serviceMessage: message,
            serverError: false,
            isLoading: false,
            errors: errors,
        };
        const state = Object.assign(defaults, opts);
        this.setState(state);
    }

    async loadRoomList() {
        this.setState({isLoading: true});
        const result = await roomsApi.list();
        if (result.error) {
            if (result.error instanceof ApiDataTypeError) {
                console.error('ApiDataTypeError');
            }
            this.setServerError('Invalid data from server');
            console.log('Invalid data from server');
        }
        else {
            const apiData = result.response.getApiData();
            if (false === Array.isArray(apiData['rooms'])) {
                this.setServerError('Invalid data from server');
                console.log('Invalid rooms data. Expected rooms[]');
                return;
            }
            const stateProps = {
                serviceMessage: '',
                roomsList: apiData.rooms,
                pageLoaded: true,
            };
            if (apiData.rooms.length) {
                stateProps.eventRoomId = apiData.rooms[0]['_id'];
                stateProps.noRooms = false;
            }
            else {
                stateProps.noRooms = true;
            }
            this.setState(stateProps);
        }
        this.setState({isLoading: false});
    }

    async addEvent() {
        this.setState({
            isLoading: true,
            errors: null,
        });
        const dateStart = dayjs(this.state.eventStartDateTime).format();
        const dateEnd = dayjs(dateStart).add(this.state.eventDuration, 'minute').format();
        console.info('addEvent dates', dateStart, dateEnd);
        const postData = {
            room: this.state.eventRoomId,
            title: this.state.eventTitle,
            description: this.state.eventDescription,
            date_start: dateStart,
            date_end: dateEnd,
        };
        const result = await eventsApi.addEvent(postData);
        if (result.error) {
            const apiCode = result.response.getApiCode();
            const apiData = result.response.getApiData();
            const apiMessage = result.response.getApiMessage();
            if (apiCode === CODES.EVENTS.VALIDATION) {
                const errorFields = result.response.getErrorFields();
                this.setValidationError('Validation error', errorFields);
                console.log('AddEvent->Validation error', errorFields);
            }
            else if (apiCode === CODES.EVENTS.CROSS_DATES) {
                const dbEvents = apiData.events;
                if (false === Array.isArray(dbEvents)) {
                    this.setServerError('Invalid data from server');
                    console.log('Expected array of events from database', apiMessage);
                    return;
                }
                const errorFields = {date_start: true, date_end: true};
                const serviceMessage = 'Date is crossed with enother events';
                this.setValidationError(serviceMessage, errorFields, {crossedEvents:dbEvents});
                console.log('AddEvent->Validation error', errorFields);
            }
            else if (apiCode === CODES.EVENTS.ROOM_NOT_EXISTS) {
                const serviceMessage = 'Room does not exist. Please try another room';
                this.setValidationError(serviceMessage);
                console.log('Room does not exists', apiMessage);
            }
            else if (apiCode === CODES.EVENTS.ROOM_NOT_ACTIVE) {
                const serviceMessage = 'Room is closed. Please try another room';
                this.setValidationError(serviceMessage);
                console.log('Room not active', apiMessage);
            }
            else {
                if (result.error instanceof ApiDataTypeError) {
                    console.error('addEvent->ApiDataTypeError');
                }
                this.setServerError('Invalid data from server');
                console.log('AddEvent->Invalid data from server', result.error);
                return;
            }
        }
        else {
            const apiData = result.response.getApiData();
            if (null === apiData.event || 'object' !== typeof apiData.event) {
                console.log('addEvent>Invalid rooms data. Expected event object');
                console.log(apiData);
                this.setServerError('Invalid data from server');
                return;
            }
            if (!apiData.event._id) {
                console.log('addEvent>Invalid rooms data. Expected event id');
                console.log(apiData);
                this.setServerError('Invalid data from server');
                return;
            }
            this.setState({
                createdEvent: apiData.event,
            });
        }

        this.setState({isLoading: false});
    }

    async handleAddEvent() {
        this.addEvent();
    }

    handleStartDateTimeChange(datetime) {
        this.setState({eventStartDateTime: datetime});
    }

    handleDurationChange(event) {
        this.setState({eventDuration: event.target.value});
    }

    handleRoomChange(event) {
        this.setState({eventRoomId: event.target.value});
    }

    handleTitleChange(event) {
        this.setState({eventTitle: event.target.value});
    }

    handleDescriptionChange(event) {
        this.setState({eventDescription: event.target.value});
    }


    render() {
        if (!this.state.pageLoaded) {
            return (
                <Container maxWidth="md" className="addEvent page skeleton">
                    <h2 className="text-center">New event</h2>
                    <Grid container spacing={3}>
                        <Grid item xs={4}>
                            <Skeleton height="4rem"/>
                        </Grid>
                        <Grid item xs={4}>
                            <Skeleton height="4rem"/>
                        </Grid>
                        <Grid item xs={4}>
                            <Skeleton height="4rem"/>
                        </Grid>
                        <Grid item xs={4}>
                            <Skeleton height="4rem"/>
                        </Grid>
                        <Grid item xs={8}>
                            <Skeleton height="4rem"/>
                        </Grid>
                        <Grid item xs={12}>
                            <Skeleton height="4rem"/>
                        </Grid>
                    </Grid>
                </Container>
            );
        }
        else if (this.state.serverError === true) {
            return (
                <Container maxWidth="md">
                    <div className="addEvent page serverError">
                        <ServiceMessage data={this.state.serviceMessage}/>
                    </div>
                </Container>
            );
        }
        else if (this.state.createdEvent) {
            console.info('created render');
            const dateStart = dayjs(this.state.eventStartDateTime).format('DD-MM-YYYY HH:mm');
            console.log('state', this.state.eventStartDateTime);
            console.log('dayjs', dateStart);
            return (
                <Container maxWidth="md">
                    <div className="addEvent page">
                        <div className="created text-center">
                            <h2>Event created successfuly in room #{this.state.createdEvent.room.number}.</h2>
                            <p>Start in: {dateStart}</p>
                            <p>Duration: {this.state.eventDuration} minutes</p>
                            <p>
                                You can <Link component={routerLink} variant="inherit" to={`/events/change/${this.state.createdEvent._id}`}>change</Link>&nbsp;or&nbsp;
                                <Link component={routerLink} variant="inherit" to={`/events/delete/${this.state.createdEvent._id}`}>delete</Link>
                            </p>
                        </div>
                    </div>
                </Container>
            );
        }
        else if (this.state.noRooms) {
            return (
                <Container maxWidth="md">
                    <div className="addEvent page">
                        <h2 className="text-center">There are no conference rooms yet</h2>
                    </div>
                </Container>
            );
        }
        else {
            console.log('else render');
            return (
                <Container maxWidth="md" className="addEvent page">
                    <h2 className="text-center">New event</h2>
                    <Grid container spacing={3}>
                        <Grid item xs={4}>
                            <FormControl fullWidth error={!!this.state.errors && !!this.state.errors.room}>
                            <FormHelperText>Rooms list</FormHelperText>
                            <Select
                                onChange={this.handleRoomChange}
                                value={this.state.eventRoomId}
                            >
                            {Array.isArray(this.state.roomsList) && this.state.roomsList.map((room, index) => (
                                <MenuItem key={room['_id']} value={room['_id']}>{room.number}</MenuItem>
                            ))}
                            </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                        <FormControl error={!!this.state.errors && !!this.state.errors.date_start}>
                            <FormHelperText>Start Date time</FormHelperText>
                            <MuiPickersUtilsProvider utils={DateUtils}>
                                <DateTimePicker
                                    value={this.state.eventStartDateTime}
                                    disablePast
                                    ampm={false}
                                    minutesStep={5}
                                    onChange={this.handleStartDateTimeChange} />
                            </MuiPickersUtilsProvider>
                        </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                            <FormControl error={!!this.state.errors && !!this.state.errors.date_end}>
                                <FormHelperText>Duration</FormHelperText>
                                <TextField inputProps={{ min: "30", step: "10" }}
                                    type="number" value={this.state.eventDuration}
                                    onChange={this.handleDurationChange}/>
                            </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                            <FormControl error={!!this.state.errors && !!this.state.errors.title}>
                                <FormHelperText>Title</FormHelperText>
                                <TextField value={this.state.eventTitle} onChange={this.handleTitleChange}/>
                            </FormControl>
                        </Grid>
                        <Grid item xs={8}>
                            <FormControl fullWidth error={!!this.state.errors && !!this.state.errors.description}>
                                <FormHelperText>Description</FormHelperText>
                                <TextField multiline fullWidth value={this.state.eventDescription} onChange={this.handleDescriptionChange}/>
                            </FormControl>
                        </Grid>
                        {this.state.serviceMessage &&(
                            <Grid item xs={12}>
                                <Alert severity="error">
                                    <div>{this.state.serviceMessage}</div>
                                        {Array.isArray(this.state.crossedEvents) && this.state.crossedEvents.map((event, index) => (
                                            <div className="crossedEvents" key={index}>
                                                {dayjs(event.date_start).format('DD-MM-YY HH:mm')}
                                                -{dayjs(event.date_end).format('HH:mm')}
                                                &nbsp; reserved by <Link component={routerLink} variant="inherit" to={`/@${event.user.name}`}>{event.user.name}</Link>
                                            </div>
                                        ))}
                                </Alert>
                            </Grid>
                        )}
                        <Grid container className="btnContainer">
                            <Button  disabled={this.state.isLoading} className="btnAddEvent" variant="contained" fullWidth
                                type="button" color="secondary" onClick={this.handleAddEvent}>Add event
                            </Button>
                            {this.state.isLoading && <Bayan/>}
                        </Grid>
                    </Grid>
                </Container>
            );
        }
    }
}

export default AddEvent;
