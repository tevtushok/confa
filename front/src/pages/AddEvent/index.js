import React from 'react';
import { Link as routerLink } from 'react-router-dom';
import { Container, Link } from '@material-ui/core';

import eventsApi from '../../services/eventsApi';
import ApiDataTypeError from '../../services/error';
import CODES from '../../services/codes';

import { RENDER_STATES } from '../../includes/saveEvent';
import { Event } from '../../includes/models';
import { EventHelper } from '../../includes/modelsHelpers';
import SaveEvent from '../../includes/saveEvent';

import EventForm from '../../components/EventForm';
import NoRooms from '../../components/NoRooms';
import EventFormSkeleton from '../../components/EventFormSkeleton';
import ServerError from '../../components/ServerError';
import AppError from '../../components/AppError';

import './index.scss';


export default class AddEvent extends SaveEvent {
    constructor(props) {
        super(props)
        const defaultStartFrom = new Date();
        defaultStartFrom.setMinutes(5 * (Math.round(defaultStartFrom.getMinutes() / 5)));
        const eventModel = new Event({
            date_start: EventHelper.dateFormat(defaultStartFrom),
            duration: 30,
        });
        console.info('eventModel', eventModel);
        this.state = {
            event: eventModel,
            roomsList: [],
            renderState: RENDER_STATES.INIT,
            serviceMessage: '',
            createdEvent: null,
            errors: {},
            crossedEvents: null,
            isLoading: false,
        }
        this.handleAddEvent = this.handleAddEvent.bind(this);
    }

    async componentDidMount() {
        await this.loadRoomList();
        if (this.state.renderState === RENDER_STATES.INIT) {
            this.setState({
                renderState: RENDER_STATES.COMMON,
            });
        }
        this.setState({isLoading: false });
    }

    async addEvent() {
        const postData = this.getPostData();
        console.info('addEvent with:', postData);
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
                renderState: RENDER_STATES.SAVED,
                createdEvent: apiData.event,
            });
        }
    }

    async handleAddEvent() {
        this.setState({
            isLoading: true,
            errors: null,
        });
        await this.addEvent();
        this.setState({
            isLoading: false,
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
                            handleStartDateTimeChange={this.handleStartDateTimeChange}
                            handleDurationChange={this.handleDurationChange}
                            handleTitleChange={this.handleTitleChange}
                            handleDescriptionChange={this.handleDescriptionChange}
                            handleSubmit={this.handleAddEvent}
                        />
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
            <p>Start in: {EventHelper.dateFormat(props.event.date_start, 'DD-MM-YYYY HH:mm')}</p>
            <p>Duration: {EventHelper.computeDuration(props.event.date_start, props.event.date_end)} minutes</p>
            <p>
                You can <Link component={routerLink} variant="inherit" to={`/events/change/${props.event._id}`}>change</Link>&nbsp;or&nbsp;
                <Link component={routerLink} variant="inherit" to={`/events/delete/${props.event._id}`}>delete</Link>
            </p>
        </div>
    );
}
