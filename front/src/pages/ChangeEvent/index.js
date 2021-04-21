import React from 'react';
import { Container } from '@material-ui/core';

import { inject } from 'mobx-react';

import eventsApi from '../../services/eventsApi';
import ApiDataTypeError from '../../services/error';
import CODES from '../../services/codes';

import { Event } from '../../includes/models';

import SaveEvent, { RENDER_STATES } from '../../components/SaveEvent';
import EventForm from '../../components/EventForm'
import EventFormSkeleton from '../../components/EventFormSkeleton';
import NoRooms from '../../components/NoRooms';
import ServerError from '../../components/ServerError';
import AppError from '../../components/AppError';

import './index.scss';


@inject('userStore')
class ChangeEvent extends SaveEvent {
    constructor(props) {
        super(props)
        const eventId = this.props.match.params.id;
        const eventModel = new Event({
            _id: eventId,
            duration: 30,
        });
        this.state = {
            ...this.state,
            event: eventModel,
            roomsList: [],
            changed: false,
            crossedEvents: null,
        }
    }

    async componentDidMount() {
        this.setState({ isLoading: true, });
        let roomState = await this.loadRoomList(false);
        if ('renderState' in roomState && roomState.renderState !== RENDER_STATES.COMMON) {
            this.setState({...roomState, isLoading: false});
            return;
        }
        let eventState = await this.loadEventDetails();
        if ('renderState' in eventState && eventState.renderState !== RENDER_STATES.COMMON) {
            this.setState({...eventState, isLoading: false});
            return;
        }
        else {
            this.setState({...roomState, ...eventState, isLoading: false,});
        }
    }

    async changeEvent() {
        const postData = this.getPostData();
        console.info('changeEvent with:', postData);
        const result = await eventsApi.changeEvent(this.state.event._id, postData);
        if (result.error) {
            const apiCode = result.response.getApiCode();
            const apiData = result.response.getApiData();
            const apiMessage = result.response.getApiMessage();
            if (apiCode === CODES.EVENTS.NOT_BELONG_TO_YOU) {
                console.log('permission error', apiMessage);
                return this.getServerErrorState('Permission denined!');
            }
            else if (apiCode === CODES.EVENTS.VALIDATION) {
                const errorFields = result.response.getErrorFields();
                console.log('changeEvent->Validation error', errorFields);
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
                console.log('changeEvent->Validation error', errorFields);
                this.getValidationErrorState(serviceMessage, errorFields, {crossedEvents:dbEvents});
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
            else {
                if (result.error instanceof ApiDataTypeError) {
                    console.error('changeEvent->ApiDataTypeError');
                }
                console.log('changeEvent->Invalid data from server', result.error);
                return this.getServerErrorState('Invalid data from server');
            }
        }
        else {
            const apiData = result.response.getApiData();
            if (null === apiData.event || 'object' !== typeof apiData.event) {
                console.log('changeEvent->Invalid rooms data. Expected event object');
                console.log(apiData);
                return this.getServerErrorState('Invalid data from server');
            }
            if (!apiData.event._id) {
                console.log('changeEvent>Invalid rooms data. Expected event id');
                console.log(apiData);
                return this.getServerErrorState('Invalid data from server');
            }

            return {
                changedEvent: apiData.event,
                renderState: RENDER_STATES.SAVED,
            };
        }
    }

    handleSubmit = async () => {
        console.log('handleSubmit');
        this.setState({
            isLoading: true,
            errors: null,
            changed: false,
            serviceMessage: '',
            renderState: RENDER_STATES.COMMON,
        });
        const state = await this.changeEvent();
        this.setState({ isLoading: false, ...state });
    }

    render() {
        console.info('render', this.state.renderState);
        let alert = null;
        let component = null;
        if (this.state.renderState === RENDER_STATES.SAVED) {
            alert = { message: 'Event saved', severity: 'success' };
        }
        switch(this.state.renderState) {
            case RENDER_STATES.NO_ROOMS:
                component = <NoRooms/>;
                break;
            case RENDER_STATES.FAILURE:
                component = <ServerError data={this.state.serviceMessage}/>;
                break;
            case RENDER_STATES.INIT:
                component = (
                    <>
                        <h2 className="text-center">Change event</h2>
                        <EventFormSkeleton/>
                    </>
                );
                break;
            case RENDER_STATES.SAVED:
            case RENDER_STATES.COMMON:
                component = (
                    <>
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
                        alert={alert}

                        handleRoomChange={this.handleRoomChange}
                        handleStartDateTimeChange={this.handleStartDateTimeChange}
                        handleDurationChange={this.handleDurationChange}
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

export default ChangeEvent;
