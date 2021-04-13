import React from 'react';
import { BASE_RENDER_STATES } from './constants';
import dayjs from 'dayjs';
import ApiDataTypeError from '../services/error';
import roomsApi from '../services/roomsApi'

export const RENDER_STATES = Object.assign({ NO_ROOMS: 'NO_ROOMS', SAVED: 'SAVED'}, BASE_RENDER_STATES);

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
        const dateStart = dayjs(this.state.event.date_start).format();
        const dateEnd = dayjs(dateStart).add(this.state.event.duration, 'minute').format();
        console.info('addEvent dates', dateStart, dateEnd);
        const postData = {
            room: this.state.event.roomId,
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
                console.info('eventRoomId', apiData.rooms[0]['_id']);
                stateProps.event.roomId = apiData.rooms[0]['_id'];
            }
            else {
                stateProps.renderState = RENDER_STATES.NO_ROOMS;
            }
            this.setState(stateProps);
        }
    }

    handleStartDateTimeChange(datetime) {
        let event = this.state.event;
        event.date_start = datetime;
        this.setState({event: event});
    }

    handleDurationChange(e) {
        let event = this.state.event;
        event.duration = e.target.value;
        this.setState({event: event});
    }

    handleRoomChange(e) {
        let event = this.state.event;
        event.roomId = e.target.value;
        this.setState({event: event});
    }

    handleTitleChange(e) {
        let event = this.state.event;
        event.title = e.target.value;
        this.setState({event: event});
    }

    handleDescriptionChange(e) {
        let event = this.state.event;
        event.description = e.target.value;
        this.setState({event: event});
    }
}
