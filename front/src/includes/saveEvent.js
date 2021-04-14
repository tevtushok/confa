import React from 'react';
import { BASE_RENDER_STATES } from './constants';
import { EventHelper } from './modelsHelpers';
import dayjs from 'dayjs';
import ApiDataTypeError from '../services/error';
import roomsApi from '../services/roomsApi'
import eventsApi from '../services/eventsApi'
import CODES from '../services/codes'

export const RENDER_STATES = {
    ...BASE_RENDER_STATES,
    NO_ROOMS: 'NO_ROOMS',
    SAVED: 'SAVED',
};

export default class SaveEvent extends React.Component {
    constructor(props) {
        super(props);
        this.handleStartDateTimeChange = this.handleStartDateTimeChange.bind(this)
        this.handleDurationChange = this.handleDurationChange.bind(this);
        this.handleRoomChange = this.handleRoomChange.bind(this);
        this.handleTitleChange = this.handleTitleChange.bind(this);
        this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
    }

    getPostData() {
        const dateStart = EventHelper.dateFormat(this.state.event.date_start);
        const dateEnd = EventHelper.computeDateEnd(dateStart, this.state.event.duration);
        console.info('event dates', dateStart, dateEnd);
        console.log('dates', dateStart, dateEnd);
        console.log('dates', this.state.event.date_start, this.state.event.duration);
        console.log('event', this.state.event);
        const postData = {
            room: this.state.event.room._id,
            title: this.state.event.title,
            description: this.state.event.description,
            date_start: dateStart,
            date_end: dateEnd,
        };
        return postData;

    }

    setServerError(message, opts = {}) {
        const defaults = {
            serviceMessage: message,
            renderState: RENDER_STATES.FAILURE,
        };
        const state = Object.assign(defaults, opts);
        this.setState(state);
    }

    setPermissionError(message, opts = {}) {
        const defaults = {
            serviceMessage: message,
            renderState: RENDER_STATES.FAILURE,
        };
        const state = Object.assign(defaults, opts);
        this.setState(state);
    }

    setValidationError(message, errors = {}, opts = {}) {
        const defaults = {
            serviceMessage: message,
            errors: errors,
        };
        const state = Object.assign(defaults, opts);
        this.setState(state);
    }

    async loadRoomList() {
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
            const stateProps = this.state;
            stateProps.serviceMessage = '';
            stateProps.roomsList = apiData.rooms;
            if (apiData.rooms.length) {
                const _id = apiData.rooms[0]['_id'];
                console.info('state.event', this.state.event);
                stateProps.event = {...this.state.event, room: { _id: _id }};
                console.info('stateProps', stateProps);
            }
            else {
                stateProps.renderState = RENDER_STATES.NO_ROOMS;
            }
            this.setState(stateProps);
        }
    }

    async loadEventDetails() {
        const result = await eventsApi.getEvent(this.state.event._id);
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
                this.setState({
                    serviceMessage: '',
                    event: { ...apiData.event, duration: duration },
                });
            }
        }
    }

    handleStartDateTimeChange(datetime) {
        // const event = new Event(this.state.event);
        this.setState({event: { ...this.state.event, date_start: datetime }});
    }

    handleDurationChange(e) {
        this.setState({event: {...this.state.event, duration: e.target.value }});
    }

    handleRoomChange(e) {
        const event = this.state.event;
        event.room._id = e.target.value;
        this.setState({event: event});
    }

    handleTitleChange(e) {
        this.setState({event: { ...this.state.event, title: e.target.value }});
    }

    handleDescriptionChange(e) {
        this.setState({event: { ...this.state.event, description: e.target.value }});
    }
}
