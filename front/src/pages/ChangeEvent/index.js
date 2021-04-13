import React from 'react';
import { inject } from 'mobx-react';
import dayjs from 'dayjs';
import eventsApi from '../../services/eventsApi';
import ApiDataTypeError from '../../services/error';
import CODES from '../../services/codes';
import { RENDER_STATES } from '../../includes/saveEvent';
import SaveEvent from '../../includes/saveEvent';
import EventForm from '../../components/EventForm'
import EventFormSkeleton from '../../components/EventFormSkeleton';
import EventChanged from '../../components/EventChanged';
import NoRooms from '../../components/NoRooms';
import ServerError from '../../components/ServerError';
import AppError from '../../components/AppError';
import { Container } from '@material-ui/core';

import './index.scss';


@inject('userStore')
class ChangeEvent extends SaveEvent {
    constructor(props) {
        super(props)
        this.defaultStartFrom = new Date();
        this.defaultStartFrom.setMinutes(5 * (Math.round(this.defaultStartFrom.getMinutes() / 5)));
        this.eventId = this.props.match.params.id;
        console.info('eventId', this.props.match.params.id);
        const event = {
            roomId: null,
            userId: null,
            title: '',
            description: '',
            date_start: this.defaultStartFrom,
            duration: 30,
        };
        this.state = {
            event: event,
            roomsList: [],
            renderState: RENDER_STATES.INIT,
            serviceMessage: '',
            changed: false,
            errors: {},
            crossedEvents: null,
            isLoading: false,
        }
    }

    async componentDidMount() {
        this.setState({
            isLoading: true,
        });
        await this.loadRoomList();
        await this.loadEventDetails();
        if (this.state.renderState === RENDER_STATES.INIT) {
            this.setState({
                renderState: RENDER_STATES.COMMON,
            });
        }
        this.setState({
            isLoading: false,
        });
    }

    async loadEventDetails() {
        const result = await eventsApi.getEvent(this.eventId);
        const apiData = result.response.getApiData();
        const apiCode = result.response.getApiCode();
        if (result.error) {
            if (result.error instanceof ApiDataTypeError) {
                console.error('ApiDataTypeError');
            }
            else if (404 === result.response.status) {
                this.setServerError('Event not found');
                console.log('Event not found');
            }
            if (apiCode === CODES.EVENTS.DETAILS_ID_REQUIRED) {
                this.setServerError('Event Id is required');
                console.log('eventId is required');
            }
            else if (apiCode === CODES.EVENTS.DETAILS_ID_INVALID) {
                this.setServerError('Invalid event Id');
                console.log('Invalid eventId');
            }
            else {
                this.setServerError('Invalid data from server');
                console.log('Invalid data from server');
            }
        }
        else {
            console.info(apiData.event.user._id);
            if ('object' !== typeof apiData.event) {
                this.setServerError('Invalid data from serverq');
                console.log('Invalid data. Expected object event');
                return;
            }
            else if (apiData.event.user._id !== this.props.userStore.user.id) {
                this.setServerError('Permission denined!');
                console.log('owner error', this.props.userStore.user.id, apiData.event.user._id);
                return;
            }
            else {
                const dateStart = dayjs(apiData.event.date_start);
                const dateEnd = dayjs(apiData.event.date_end);
                const duration = dateEnd.diff(dateStart, 'minute');
                const eventState = {
                    roomId: apiData.event.room._id,
                    userId: apiData.event.user._id,
                    title: apiData.event.title,
                    description: apiData.event.description,
                    date_start: apiData.event.date_start,
                    duration: duration,
                };
                this.setState({
                    serviceMessage: '',
                    event: eventState,
                });
            }
        }
    }

    async changeEvent() {
        const dateStart = dayjs(this.state.event.date_start).format();
        const dateEnd = dayjs(dateStart).add(this.state.event.duration, 'minute').format();
        console.info('changeEvent dates', dateStart, dateEnd);
        const postData = {
            room: this.state.event.roomId,
            title: this.state.event.title,
            description: this.state.event.description,
            date_start: dateStart,
            date_end: dateEnd,
        };
        const result = await eventsApi.changeEvent(this.eventId, postData);
        if (result.error) {
            const apiCode = result.response.getApiCode();
            const apiData = result.response.getApiData();
            const apiMessage = result.response.getApiMessage();
            if (apiCode === CODES.EVENTS.VALIDATION) {
                const errorFields = result.response.getErrorFields();
                this.setValidationError('Validation error', errorFields);
                console.log('changeEvent->Validation error', errorFields);
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
                console.log('changeEvent->Validation error', errorFields);
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
                    console.error('changeEvent->ApiDataTypeError');
                }
                this.setServerError('Invalid data from server');
                console.log('changeEvent->Invalid data from server', result.error);
                return;
            }
        }
        else {
            const apiData = result.response.getApiData();
            if (null === apiData.event || 'object' !== typeof apiData.event) {
                console.log('changeEvent->Invalid rooms data. Expected event object');
                console.log(apiData);
                this.setServerError('Invalid data from server');
                return;
            }
            if (!apiData.event._id) {
                console.log('changeEvent>Invalid rooms data. Expected event id');
                console.log(apiData);
                this.setServerError('Invalid data from server');
                return;
            }
            this.setState({
                changedEvent: apiData.event,
                componentStatus: RENDER_STATES.SAVED,
            });
        }
    }

    handleSubmit = async () => {
        console.log('handleSubmit');
        this.setState({
            isLoading: true,
            errors: null,
            changed: false,
            serviceMessage: '',
        });
        await this.changeEvent();
        this.setState({ isLoading: false });
    }

    render() {
        console.info('render', this.state.renderState);
        console.log(RENDER_STATES);
        switch(this.state.renderState) {
            case RENDER_STATES.SAVED:
                return (
                    <Container maxWidth="md" className="changeEvent page created">
                        <EventChanged event={this.state.event}/>
                    </Container>
                );
            case RENDER_STATES.NO_ROOMS:
                return(
                    <Container maxWidth="md" className="changeEvent page noRooms">
                        <NoRooms/>
                    </Container>
                );
            case RENDER_STATES.FAILURE:
                return (
                    <Container maxWidth="md" className="changeEvent page serverError">
                        <ServerError data={this.state.serviceMessage}/>
                    </Container>
                );
            case RENDER_STATES.INIT:
                return (
                    <Container maxWidth="md" className="changeEvent page skeleton">
                        <h2 className="text-center">Change event</h2>
                        <EventFormSkeleton/>
                    </Container>
                );
            case RENDER_STATES.COMMON:
                return (
                    <Container maxWidth="md" className="changeEvent page">
                        <h2 className="text-center">Change event</h2>
                        <EventForm
                        isLoading={this.state.isLoading}
                        errors={this.state.errors}
                        serviceMessage={this.state.serviceMessage}
                        roomsList={this.state.roomsList}
                        crossedEvents={this.state.crossedEvents}

                        action="change"
                        componentStatus={this.state.componentStatus}

                        event={this.state.event}

                        handleRoomChange={this.handleRoomChange}
                        handleStartDateTimeChange={this.handleStartDateTimeChange}
                        handleDurationChange={this.handleDurationChange}
                        handleTitleChange={this.handleTitleChange}
                        handleDescriptionChange={this.handleDescriptionChange}
                        handleSubmit={this.handleSubmit} />
                    </Container>
                );
            default:
                return(
                    <Container maxWidth="md" className="addEvent page">
                        <AppError data="Application error"/>
                    </Container>
                );
        }
    }
}

export default ChangeEvent;
