import React from 'react';
import dayjs from 'dayjs';
import { withRouter } from "react-router";
import { Link as routerLink } from 'react-router-dom';
import { Container, Link } from '@material-ui/core';

import eventsApi from '../../services/eventsApi';
import ApiDataTypeError from '../../services/error';
import CODES from '../../services/codes';

import { Event } from '../../includes/models';
import { EventHelper } from '../../includes/modelsHelpers';

import SaveEvent, { RENDER_STATES } from '../../components/SaveEvent';
import EventForm from '../../components/EventForm';
import NoRooms from '../../components/NoRooms';
import EventFormSkeleton from '../../components/EventFormSkeleton';
import ServerError from '../../components/ServerError';
import AppError from '../../components/AppError';

import './index.scss';


@withRouter
class AddEvent extends SaveEvent {
    constructor(props) {
        super(props)
        this.state = {
            ...this.state,
            roomsList: [],
            createdEvent: null,
            crossedEvents: null,
        };
        this.initEventState();
        this.handleAddEvent = this.handleAddEvent.bind(this);
    }

    initEventState() {
        const defaultStartFrom = new Date();
        defaultStartFrom.setMinutes(5 * (Math.round(defaultStartFrom.getMinutes() / 5)));
        let defaultEvent = new Event({
            date_start: defaultStartFrom,
            date_end: dayjs(defaultStartFrom).add(30, 'minute'),
        });

        if (this.props.match.params.roomId) {
            this.state.event = this.getEventFromUrl(defaultEvent);
        }
        else {
            this.state.event = defaultEvent;
        }
    }

    getEventFromUrl(event = {}) {
        const roomId = this.props.match.params.roomId;
        const dateFrom = this.props.match.params?.from ? dayjs(this.props.match.params.from) : undefined;
        const dateTo = this.props.match.params?.to? dayjs(this.props.match.params.to) : undefined;

        event.room = { _id: roomId, };

        if (dateFrom && dateFrom.isValid()) {
            event.date_start = dateFrom;
            event.date_end = dateTo && dateTo.isValid() ? dateTo : dateFrom.add(30, 'minute');
        }

        return event;
    }


    async componentDidMount() {
        this.setState({ isLoading: false, });
        const setRoomState = !(this.state.event.room?._id);
        const newStateOpts = await this.loadRoomList(setRoomState);
        this.setState({ ...newStateOpts, isLoading: false, });
    }

    async addEvent() {
        const postData = this.getPostData();
        console.info('addEvent with:', postData);
        try {
            const result = await eventsApi.addEvent(postData);
            const apiData = result.response.getApiData();
            if (null === apiData.event || 'object' !== typeof apiData.event) {
                console.log('addEvent>Invalid rooms data. Expected event object');
                console.log(apiData);
                return this.getServerErrorState('Invalid data from server');
            }
            if (!apiData.event._id) {
                console.log('addEvent>Invalid rooms data. Expected event id');
                console.log(apiData);
                return this.getServerErrorState('Invalid data from server');
            }
            const state = {
                renderState: RENDER_STATES.SAVED,
                createdEvent: apiData.event,
            };
            return state;
        }
        catch ({ response, error }) {
            if (response) {
                const apiCode = response.getApiCode();
                const apiData = response.getApiData();
                const apiMessage = response.getApiMessage();
                if (apiCode === CODES.EVENTS.VALIDATION) {
                    const errorFields = response.getErrorFields();
                    console.log('AddEvent->Validation error', errorFields);
                    return this.getValidationErrorState('Validation error', errorFields);
                }
                else if (apiCode === CODES.EVENTS.CROSS_DATES) {
                    const dbEvents = apiData.events;
                    if (false === Array.isArray(dbEvents)) {
                        console.log('Expected array of events from database', apiMessage);
                        return this.getServerErrorState('Invalid data from server');
                    }
                    const errorFields = {date_start: true, date_end: true};
                    const serviceMessage = 'Date is crossed with enother events';
                    console.log('AddEvent->Validation error', errorFields);
                    return this.getValidationErrorState(serviceMessage, errorFields, {crossedEvents:dbEvents});
                }
                else if (apiCode === CODES.EVENTS.ROOM_NOT_EXISTS) {
                    const serviceMessage = 'Room does not exist. Please try another room';
                    console.log('Room does not exists', apiMessage);
                    return this.getValidationErrorState(serviceMessage);
                }
                else if (apiCode === CODES.EVENTS.ROOM_NOT_ACTIVE) {
                    const serviceMessage = 'Room is closed. Please try another room';
                    console.log('Room not active', apiMessage);
                    return this.getValidationErrorState(serviceMessage);
                }
            }
            else {
                if (error instanceof ApiDataTypeError) {
                    console.error('addEvent->ApiDataTypeError');
                }
                console.log('AddEvent->Invalid data from server');
                return this.getServerErrorState('Invalid data from server');
            }
        }
    }

    async handleAddEvent() {
        let validate = this.validate();
        if (true !== validate ) {
            this.setState({ errors: validate });
            return;
        }
        this.setState({
            isLoading: true,
            errors: {},
        });
        const newStateOpts = await this.addEvent();
        this.setState({
            isLoading: false,
            ...newStateOpts,
        });
    }

    render() {
        console.info('render', this.state.renderState);
        let component = null;
        switch(this.state.renderState) {
            case RENDER_STATES.SAVED:
                component = <EventCreated event={this.state.createdEvent}/>;
                break;
            case RENDER_STATES.NO_ROOMS:
                component = <NoRooms/>;
                break;
            case RENDER_STATES.FAILURE:
                component = <ServerError data={this.state.serviceMessage}/>;
                break;
            case RENDER_STATES.INIT:
                component = <EventFormSkeleton/>;
                break;
            case RENDER_STATES.COMMON:
                component = (
                    <>
                        <h2 className="text-center">Add event</h2>
                        <EventForm
                            isLoading={this.state.isLoading}
                            errors={this.state.errors}
                            serviceMessage={this.state.serviceMessage}
                            roomsList={this.state.roomsList}
                            crossedEvents={this.state.crossedEvents}

                            action="add"
                            renderState={this.state.renderState}

                            event={this.state.event}

                            handleRoomChange={this.handleRoomChange}
                            handleDateStartChange={this.handleDateStartChange}
                            handleDateEndChange={this.handleDateEndChange}
                            handleTitleChange={this.handleTitleChange}
                            handleDescriptionChange={this.handleDescriptionChange}
                            handleSubmit={this.handleSubmit} />
                    </>
                );
                break;
            default:
                component = <AppError data="Application error"/>;
        }

        return(
            <Container maxWidth="md" className={`addEvent page ${String(this.state.renderState).toLowerCase()}`}>
                {component}
            </Container>
        );
    }
}

function EventCreated(props) {
    return (
        <div className="created text-center">
            <h2>Event created successfuly in room #{props.event.room.number}.</h2>
            <p>Start at: {EventHelper.dateFormat(props.event.date_start, 'DD-MM-YYYY HH:mm')}</p>
            <p>End at: {EventHelper.dateFormat(props.event.date_end, 'DD-MM-YYYY HH:mm')}</p>
            <p>
                You can <Link component={routerLink} variant="inherit" to={`/events/change/${props.event._id}`}>change</Link>&nbsp;or&nbsp;
                <Link component={routerLink} variant="inherit" to={`/events/delete/${props.event._id}`}>delete</Link>
            </p>
        </div>
    );
}

export default AddEvent;
