import React from 'react';
import dayjs from 'dayjs';
import memoize from 'memoize-one';
import {
    Grid,
    Container,
    TextField,
} from '@material-ui/core'

import DateUtils from '@date-io/dayjs';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
} from '@material-ui/pickers';

import BaseComponent, { RENDER_STATES as BASE_RENDER_STATES } from '../../components/BaseComponent'
import RoomEvents from '../../components/RoomEvents'
import Bayan from '../../components/Bayan'
import NoRooms from '../../components/NoRooms';
import ServerError from '../../components/ServerError';
import AppError from '../../components/AppError';


import CODES from '../../services/codes';
import roomsApi from '../../services/roomsApi'

import './index.scss';

const RENDER_STATES = { ...BASE_RENDER_STATES, NO_ROOMS: 'NO_ROOMS', UPDATE: 'UPDATE' };


export default class Events extends BaseComponent {
    constructor(props) {
        super(props);

        this.stepMinutes = 30;
        this.timeLineLabelFormat = 'HH:mm';

        this.state = {
            ...this.state,
            // selectedDate: dayjs().add('1', 'day').format('YYYY-MM-DD'),
            selectedDate: dayjs(),
            roomsFilterValue: '',
        };

        this.prevRoomList = null;

        this.roomEventsRef = React.createRef();
    }

    async componentDidMount() {
        this.loadRoomsWithEventsOfDay();
    }

    filter = memoize(
        (list, filter) => {
            let filteredField = 'title';
            // check value is integer, n ^ 0 returns type number so we dont need strict equals
            // and i dont need strict compare
            // eslint-disable-next-line
            if (this.state.roomsFilterValue == (this.state.roomsFilterValue ^ 0)) {
                filteredField = 'number';
            }
            return this.state.rooms.filter(room => {
                const re = new RegExp(this.state.roomsFilterValue, 'i');
                return -1 !== room[filteredField].toString().search(re);
            });
        }
    )

    // getDate() {
    //     return dayjs().startOf('day').toISOString()
    // }

    applyRoomFilterValue = (value) => {
        this.setState({ roomsFilterValue: value });
    }

    async loadRoomsWithEventsOfDay(date = null) {
        this.setState({ isLoading: true });
        const datePost = date || this.state.selectedDate;
        let resultState = {};
        roomsApi.getRoomsWithEventsOfDay(datePost)
            .then(({ response }) => {
                const apiData = response.getApiData();
                if (null === apiData.data || 'object' !== typeof apiData.data) {
                    console.log('loadRoomsWithEvents->Invalid rooms data. Expected data object');
                    return this.getServerErrorState('Invalid data from server');
                }
                if (!apiData.data.length) {
                    return {
                        renderState: RENDER_STATES.NO_ROOMS,
                    };
                }
                // apiData.data.length = 1; // !!!!!!!!! for debug
                const state = {
                    rooms: apiData.data,
                    renderState: RENDER_STATES.COMMON,
                };
                resultState = state;
            })
            .catch(({ error, response }) => {
                const apiCode = response.getApiCode();
                if (apiCode === CODES.ROOMS.INVALID_DATE) {
                    console.log('Invalid date');
                    resultState = this.getServerErrorState('Invalid date');
                }
                else {
                    console.log('Invalid data from server');
                    resultState = this.getServerErrorState('Invalid data from server');
                }
            })
            .finally(() => {
                this.setState({ isLoading: false, ...resultState});
            });
    }

    handleRoomsFilterChange = (e) => {
        this.setState({roomsFilterValue: e.target.value})
    }

    /*
     * return object with timeline details for full day
     * e.g. current time is 10:30
    {
        nowIndex: 0,
            nowLabel: 10:30,
            items[
                {
                    { label:00:00, date: new Date(00:00)},
                    ...
                    { label:23:30, date: new Date(23:30)}
                }
            ]
    }
    */
    getTimeLine() {
        const timeLineLen = (60 / this.stepMinutes) * 24;
        let selectedDate = dayjs(this.state.selectedDate);
        let now = dayjs();
        // now = now.hour(1).minute(1);
        let timeLineDate = dayjs(selectedDate).hour(now.hour()).minute(now.minute()).second(0).millisecond(0);

        // for client last possible time button is 23:30
        if (timeLineDate.hour() === 23 && timeLineDate.minute() > 30) {
            timeLineDate = timeLineDate.minute(30);
        }
        else {
            timeLineDate = timeLineDate.minute(this.stepMinutes * (Math.ceil(timeLineDate.minute() / this.stepMinutes)));
        }

        let nowLabel = null;
        let nowIndex = null;
        nowLabel = timeLineDate.format(this.timeLineLabelFormat);

        // if (now.format('YYYY-MM-DD') !== timeLineDate.format('YYYY-MM-DD')) {
        //     // for now working day starts at 09.00, but maybe in future its will be config from use profile page :)
        //     // nowLabel = dayjs(timeLineDate).hour(9).format(this.timeLineLabelFormat);
        // }
        // else {
        //     nowLabel = timeLineDate.format(timeLineLabelFormat);
        // }
        // const now = dayjs('18 apr 2021 23:00').second(0).millisecond(0);

        const startOfDay = dayjs(timeLineDate).startOf('day');

        let allItems = [];

        for(let i = 0; i < timeLineLen; i++) {
            let date = startOfDay.add(i * this.stepMinutes, 'minute')
            let label = date.format(this.timeLineLabelFormat);

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

        return timeLine;

    }

    handleDateChange = async(date) => {
        this.setState({ selectedDate: date, renderState: RENDER_STATES.UPDATE });
        this.loadRoomsWithEventsOfDay(date);
    }

    render() {
        console.info(' Events page render', this.state.renderState);
        let component = null;
        switch(this.state.renderState) {
            case RENDER_STATES.FAILURE:
                component = <ServerError data={this.state.serviceMessage}/>;
                break;
            case RENDER_STATES.INIT:
                component = <Bayan/>;
                break;
            case RENDER_STATES.UPDATE:
                component = this.prevRoomList;
                break;
            case RENDER_STATES.NO_ROOMS:
                component = <NoRooms/>;
                break;
            case RENDER_STATES.COMMON:
                this.timeLine = this.getTimeLine();
                let rooms = null;
                if (this.state.roomsFilterValue.length) {
                    rooms = this.filter(this.state.rooms, this.state.roomsFilterValue);
                }
                else {
                    rooms = this.state.rooms;
                }
                let breakPoints = { xs: 12, sm: 12, md: 6, lg: 6, xl: 6, };
                let spacing = 4;

                if (this.state.rooms.length === 1) {
                    breakPoints = { xs: 12, sm: 12, md: 12, lg: 12, xl: 12, };
                    spacing = 0;
                }


                const loopRooms = (rooms) => {
                    const list = [];
                    rooms.forEach(room => {
                        list.push(
                            <Grid key={room._id} item {...breakPoints}>
                                <RoomEvents date={this.state.selectedDate} stepMinutes={this.stepMinutes} timeLine={this.timeLine} room={room}/>
                            </Grid>
                        );
                    });
                    return list;
                };

                component = (
                    <>
                        <Grid container className="filter" justify="center" spacing={4}>
                            <Grid item xs={6} >
                                <RoomFilter applyFilter={this.applyRoomFilterValue}
                                    handleChange={this.handleRoomsFilterChange}
                                    value={this.state.roomsFilterValue}/>
                            </Grid>
                            <Grid item xs={6}>
                                <EventsDatePicker selectedDate={this.state.selectedDate} applyDate={this.handleDateChange}/>
                            </Grid>
                        </Grid>
                        {!rooms.length && (
                            <div className="filterEmptyResult">
                                <h2>No rooms founded</h2>
                            </div>
                        )}
                        <Grid container className={`roomEvents roomsLen${rooms.length}`} spacing={spacing} ref={this.roomEventsRef}>
                            {loopRooms(rooms)}
                        </Grid>
                    </>
                );
                this.prevRoomList = component;
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

class RoomFilter extends React.Component {

    constructor(props) {
        super(props);
        this.state = { value: props.value };
        this.timeout = null;
        this.applyFilter = props.applyFilter;
    }

    handleChange = (e) => {
        this.setState({ value: e.target.value });
        clearTimeout(this.timeout);
        setTimeout(() => {
            this.applyFilter(this.state.value);
        }, 400);
    };
    render() {
        const inputLabelProps = { shrink: true, };
        const inputProps = {
            type: 'text',
        };
        return (
            <div className="roomsFilterValueWrapper">
                <TextField label="Room" inputProps={inputProps} InputLabelProps={inputLabelProps} id="roomsFilterValue"
                    onChange={this.handleChange}
                    value={this.state.value} />
            </div>
        );
    }
}

class EventsDatePicker extends React.Component {
    constructor(props) {
        super(props);
        this.state = { selectedDate: props.selectedDate };
        this.timeout = null;
        this.applyDate = props.applyDate;
    }
    handleChange = (date) => {
        this.setState({ selectedDate: date });
        setTimeout(() => {
            clearTimeout(this.timeout);
            this.applyDate(this.state.selectedDate);
        }, 500);
    }
    render() {
        const inputLabelProps = { shrink: true, };
        return(
            <MuiPickersUtilsProvider utils={DateUtils}>
                <KeyboardDatePicker
                    id="date-dialog"
                    label="Date"
                    format="YYYY/MM/DD"
                    InputLabelProps={inputLabelProps}
                    value={this.state.selectedDate}
                    onChange={this.handleChange}
                    KeyboardButtonProps={{
                        'aria-label': 'change date',
                    }}
                />
            </MuiPickersUtilsProvider>
        );
    }
}
