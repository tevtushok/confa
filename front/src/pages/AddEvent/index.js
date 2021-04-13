import React from 'react';
import { Container } from '@material-ui/core';
import eventsApi from '../../services/eventsApi';
import ApiDataTypeError from '../../services/error';
import CODES from '../../services/codes';
import { RENDER_STATES } from '../../includes/saveEvent';
import SaveEvent from '../../includes/saveEvent';
import EventForm from '../../components/EventForm';
import NoRooms from '../../components/NoRooms';
import EventFormSkeleton from '../../components/EventFormSkeleton';
import EventCreated from '../../components/EventCreated';
import ServerError from '../../components/ServerError';
import AppError from '../../components/AppError';

import './index.scss';


class AddEvent extends SaveEvent {
    constructor(props) {
        super(props)
        this.defaultStartFrom = new Date();
        this.defaultStartFrom.setMinutes(5 * (Math.round(this.defaultStartFrom.getMinutes() / 5)));
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
        this.setState({isLoading: false});
    }

    async addEvent() {
        const postData = this.getPostData();
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
        switch(this.state.renderState) {
            case RENDER_STATES.SAVED:
                return (
                    <Container maxWidth="md" className="addEvent page created">
                        <EventCreated event={this.state.createdEvent}/>
                    </Container>
                );
            case RENDER_STATES.NO_ROOMS:
                return(
                    <Container maxWidth="md" className="addEvent page noRooms">
                        <NoRooms/>
                    </Container>
                );
            case RENDER_STATES.FAILURE:
                return (
                    <Container maxWidth="md" className="addEvent page serverError">
                        <ServerError data={this.state.serviceMessage}/>
                    </Container>
                );
            case RENDER_STATES.INIT:
                return (
                    <Container maxWidth="md" className="addEvent page skeleton">
                        <EventFormSkeleton/>
                    </Container>
                );
            case RENDER_STATES.COMMON:
                return (
                    <Container maxWidth="md" className="addEvent page">
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

export default AddEvent;
