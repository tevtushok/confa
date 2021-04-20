import React from 'react';
import { Link } from "react-router-dom";
import dayjs from 'dayjs';
import {
    Button,
    Grid,
    Container,
} from '@material-ui/core'

import {
    ToggleButtonGroup,
    ToggleButton,
    Alert,
} from '@material-ui/lab'

import BaseComponent, { RENDER_STATES as BASE_RENDER_STATES } from '../../components/BaseComponent'
import RoomEvents from '../../components/RoomEvents'
import Bayan from '../../components/Bayan'
import NoRooms from '../../components/NoRooms';
import ServerError from '../../components/ServerError';
import AppError from '../../components/AppError';


import CODES from '../../services/codes';
import ApiDataTypeError from '../../services/error';
import roomsApi from '../../services/roomsApi'

import './index.scss';

const RENDER_STATES = { ...BASE_RENDER_STATES, NO_ROOMS: 'NO_ROOMS', };

export default class Events extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            ...this.state,
            date: null,
            roomsFilter: [],
        };
        this.roomEventsRef = React.createRef();
        this.timeLine = this.getTimeLine();
    }

    async componentDidMount() {
        this.setState({ isLoading: true });
        await this.loadRoomsWithEventsOfDay();
        this.setState({ isLoading: false });
    }


    getDate() {
        return dayjs().startOf('day').toISOString()
    }

    async loadRoomsWithEventsOfDay() {
        const date = this.getDate();
        const result = await roomsApi.getRoomsWithEventsOfDay(date);
        const apiCode = result.response.getApiCode();
        if (result.error || 0 !== apiCode) {
            const apiData = result.response.getApiData();
            const apiMessage = result.response.getApiMessage();
            if (CODES.ROOMS.INVALID_DATE === apiCode) {
                this.setServerError('Invalid date');
                console.log('Invalid date');
                return;
            }
            if (result.error instanceof ApiDataTypeError) {
                console.error('loadRoomsWithEvents ApiDataTypeError');
            }
            this.setServerError('Invalid data from server');
            return;
        }
        else {
            const apiData = result.response.getApiData();
            if (null === apiData.data || 'object' !== typeof apiData.data) {
                console.log('loadRoomsWithEvents->Invalid rooms data. Expected data object');
                this.setServerError('Invalid data from server');
                return;
            }
            if (!apiData.data.length) {
                this.setState({
                    renderState: RENDER_STATES.NO_ROOMS,
                });
                return;
            }
            // apiData.data.length = 1; // !!!!!!!!! for debug
            this.setState({
                data: apiData.data,
                renderState: RENDER_STATES.COMMON,
            });
        }
    }

    roomFilterToogleRoom(e, newFilter) {
        // let currentFilter = this.state.roomsFilter;
        this.setState({roomsFilter: newFilter})
        let ymd = this.getDate()
        this.getEvents(ymd, newFilter)
    }

    /*
     * Summary. array with times eg. [10:30, 11:00: 11:30...]
     * Description.
     * Return array of time for RoomEvents component. Only for current day.
     * If some time is next day - time will be: time = time - @timeStep minutes. Its need for pretty interface.
     * @timeStep - step for time ranges
     * @length length of result
     * @return {array} sorted array with times
     */
    getTimeLine() {
        const stepMinutes = 30;
        const timeLineLen = (60 / stepMinutes) * 24;
        const labelFormat = 'HH:mm';

        let now = dayjs().second(0).millisecond(0);
        now = now.minute(stepMinutes * (Math.round(now.minute() / stepMinutes)));
        // const now = dayjs('18 apr 2021 23:00').second(0).millisecond(0);
        // for client last possible time button is 23:30;
        if (now.hour() === 23 && now.minute() > 30) {
            now.minute(30);
        }
        else {
            now.minute(stepMinutes * (Math.round(now.minute() / stepMinutes)));
        }
        const nowLabel = now.format(labelFormat);
        let nowIndex = null;

        const startOfDay = dayjs().startOf('day');

        let allItems = [];

        for(let i = 0; i < timeLineLen; i++) {
            let date = startOfDay.add(i * stepMinutes, 'minute')
            let label = date.format(labelFormat);

            if (label === nowLabel) {
                nowIndex = i;
            }

            allItems.push({
                label: label,
                date: date,
            });
        }

        let timeLine = {
            items: allItems,
            nowLabel: nowLabel,
            nowIndex: nowIndex,
        };

        console.log('*********************************************');
        console.log(timeLine);
        console.log('*********************************************');

        return timeLine;

    }

    render() {
        console.info('render events page', this.state.renderState);
        let component = null;
        switch(this.state.renderState) {
            case RENDER_STATES.FAILURE:
                component = <ServerError data={this.state.serviceMessage}/>;
                break;
            case RENDER_STATES.INIT:
                component = <Bayan/>;
                break;
            case RENDER_STATES.NO_ROOMS:
                component = <NoRooms/>;
                    break;
            case RENDER_STATES.COMMON:
                console.info('RENDER_STATES.COMMON', this.timeLine);

                let breakPoints = {
                    xs: 12,
                    sm: 12,
                    md: 6,
                    lg: 6,
                    xl: 6,
                };
                let spacing = 4;

                if (this.state.data.length === 1) {
                    breakPoints = {
                        xs: 12,
                        sm: 12,
                        md: 12,
                        lg: 12,
                        xl: 12,
                    };
                    spacing = 0;
                }
                component = (
                    <>
                        <Grid container className="filter">
                            <ToggleButtonGroup size="small" value={this.state.roomsFilter} onChange={this.roomFilterToogleRoom} aria-label="Room filter">
                                {this.state.data.map((room, index) => (
                                    <ToggleButton key={room['_id']} value={room.number} aria-label={room.number}>{room.number}</ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                        </Grid>
                        <Grid container className="roomEvents" spacing={spacing} ref={this.roomEventsRef}>
                        {this.state.data.map((room, index) => (
                            <Grid key={room._id} item {...breakPoints}>
                                <RoomEvents timeLine={this.timeLine} room={room}/>
                            </Grid>
                        ))}
                        </Grid>
                        <div className="addEvent btnContainer">
                            <Button component={Link} to="/events/add" variant="contained" color="secondary" fullWidth type="submit" disabled={this.state.isLoading}>
                            Add event
                            </Button>
                        </div>
                    </>
                );
                break;
            default:
                component = <AppError/>;
        }

        return(
            <Container maxWidth="md" className={`events page ${String(this.state.renderState).toLowerCase()}`}>
                {component}
            </Container>
        );
    }
}
