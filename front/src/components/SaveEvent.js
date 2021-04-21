import dayjs from 'dayjs';

import { EventHelper } from '../includes/modelsHelpers';

import ApiDataTypeError from '../services/error';
import roomsApi from '../services/roomsApi'
import eventsApi from '../services/eventsApi'
import CODES from '../services/codes'

import BaseComponent, { RENDER_STATES as BASE_RENDER_STATES } from '../components/BaseComponent';

export const RENDER_STATES = {
    ...BASE_RENDER_STATES,
    NO_ROOMS: 'NO_ROOMS',
    SAVED: 'SAVED',
};

export default class SaveEvent extends BaseComponent {

    getPostData() {
        const dateStart = EventHelper.dateFormat(this.state.event.date_start);
        const dateEnd = EventHelper.computeDateEnd(dateStart, this.state.event.duration);
        const postData = {
            room: this.state.event.room._id,
            title: this.state.event.title,
            description: this.state.event.description,
            date_start: dateStart,
            date_end: dateEnd,
        };
        return postData;

    }

    async loadRoomList(setRoomState = true) {
        const result = await roomsApi.list();
        if (result.error) {
            if (result.error instanceof ApiDataTypeError) {
                console.error('ApiDataTypeError');
            }
            console.log('Invalid data from server');
            return this.getServerErrorState('Invalid data type from server');
        }
        else {
            const apiData = result.response.getApiData();
            if (false === Array.isArray(apiData['rooms'])) {
                console.log('Invalid rooms data. Expected rooms[]');
                return this.getServerErrorState('Invalid data from server');
            }
            const stateProps = {};
            stateProps.serviceMessage = '';
            stateProps.roomsList = apiData.rooms;
            stateProps.renderState = RENDER_STATES.COMMON;
            if (!apiData.rooms.length) {
                stateProps.renderState = RENDER_STATES.NO_ROOMS;
            }
            else if (setRoomState) {
                const _id = apiData.rooms[0]['_id'];
                console.info('state.event', this.state.event);
                stateProps.event = {...this.state.event, room: { _id: _id }};
                console.info('stateProps', stateProps);
            }
            return stateProps;
        }
    }

    async loadEventDetails() {
        const result = await eventsApi.getEvent(this.state.event._id);
        const apiData = result.response.getApiData();
        const apiCode = result.response.getApiCode();
        if (result.error) {
            if (result.error instanceof ApiDataTypeError) {
                console.error('ApiDataTypeError');
                return this.getServerErrorState('Invalid data type from server');
            }
            else if (404 === result.response.status) {
                console.log('Event not found');
                return this.getServerErrorState('Event not found');
            }
            if (apiCode === CODES.EVENTS.DETAILS_ID_REQUIRED) {
                console.log('eventId is required');
                return this.getServerErrorState('Event Id is required');
            }
            else if (apiCode === CODES.EVENTS.DETAILS_ID_INVALID) {
                console.log('Invalid eventId');
                return this.getServerErrorState('Invalid event Id');
            }
            else {
                console.log('Invalid data from server');
                return this.getServerErrorState('Invalid data from server');
            }
        }
        else {
            console.info(apiData.event.user._id);
            if ('object' !== typeof apiData.event) {
                console.log('Invalid data. Expected object event');
                return this.getServerErrorState('Invalid data from serverq');
            }
            else if (apiData.event.user._id !== this.props.userStore.user.id) {
                console.log('owner error', this.props.userStore.user.id, apiData.event.user._id);
                return this.getServerErrorState('Permission denined!');
            }
            else {
                const dateStart = dayjs(apiData.event.date_start);
                const dateEnd = dayjs(apiData.event.date_end);
                const duration = dateEnd.diff(dateStart, 'minute');

                const state = {
                    serviceMessage: '',
                    renderState: RENDER_STATES.COMMON,
                    event: { ...apiData.event, duration: duration },
                };
                return state;
            }
        }
    }

    handleStartDateTimeChange = (datetime) => {
        let errors = this.state.errors;
        const validate = this.validateDateStart(datetime);
        true === validate ? delete errors.date_start: errors.date_start= validate;
        this.setState({event: { ...this.state.event, date_start: datetime }});
    };

    handleDurationChange = (e) => {
        let errors = this.state.errors;
        const validate = this.validateDuration(e.target.value);
        true === validate ? delete errors.duration: errors.duration= validate;
        this.setState({event: {...this.state.event, duration: e.target.value }});
    };

    handleRoomChange = (e) => {
        const event = this.state.event;
        event.room._id = e.target.value;
        this.setState({event: event});
    };

    handleTitleChange = (e) => {
        let errors = this.state.errors;
        const validate = this.validateTitle(e.target.value);
        true === validate ? delete errors.title : errors.title = validate;
        this.setState({event: { ...this.state.event, title: e.target.value, errors }});
    };

    handleDescriptionChange = (e) => {
        this.setState({event: { ...this.state.event, description: e.target.value }});
    };

    validateDateStart = (date_start = '') => {
        const valid = isNaN(date_start);
        return valid ? true : { message: 'Invalid date' };
    }

    validateDuration = (duration = 0) => {
        const valid = Number.isInteger(duration) && duration > 0;
        return valid ? true : { message: 'Allowed only integers' };
    }

    validateTitle = (title = '') => {
        const valid = title.length > 2;
        return valid ? true : { message: 'Less than 3 symbols' };
    }

    validate = () => {
        let errors = {};
        let validate = null;
        if (true !== (validate = this.validateDateStart(this.state.event.date_start))) {
            errors.date_start = validate;
        }
        if (true !== (validate = this.validateDuration(this.state.event.duration))) {
            errors.duration = validate;
        }
        if (true !== (validate = this.validateTitle(this.state.event.title))) {
            errors.title = validate;
        }

        return Object.keys(errors).length ? errors : true;
    };
}
