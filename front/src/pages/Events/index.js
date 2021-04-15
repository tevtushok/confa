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

import BaseComponent from '../../components/BaseComponent'
import EventsRoom from '../../components/EventsRoom'
import Bayan from '../../components/Bayan'
import NoRooms from '../../components/NoRooms';
import ServerError from '../../components/ServerError';
import AppError from '../../components/AppError';

import { BASE_RENDER_STATES } from '../../includes/constants';

import CODES from '../../services/codes';
import ApiDataTypeError from '../../services/error';
import roomsApi from '../../services/roomsApi'
import eventsApi from '../../services/eventsApi';

import './index.scss';

const RENDER_STATES = { ...BASE_RENDER_STATES, NO_ROOMS: 'NO_ROOMS', };

export default class Events extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            isLoading: false,
            errorMessage: '',
            roomsFilter : [],
            pageLoaded: false,
            renderState: RENDER_STATES.INIT,
        }
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
                component = (
                    <>
                        <Grid container className="filter">
                            <ToggleButtonGroup size="small" value={this.state.roomsFilter} onChange={this.roomFilterToogleRoom} aria-label="Room filter">
                                {this.state.data.map((room, index) => (
                                    <ToggleButton key={room['_id']} value={room.number} aria-label={room.number}>{room.number}</ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                        </Grid>
                        <Grid container className="roomsList">
                        {this.state.data.map((room, index) => (
                            <Grid key={room._id} item md={6} sm={12}>
                            {/* <EventsRoom data={event}/>--> */}
                            <EventsRoom data={room}/>
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
// return (
//     <Container maxWidth="md" className="events page">
//     <h2>Events</h2>
//     <div id="EventsMessages">
//     {this.state.errorMessage && (
//         <Alert className="rooms__alert" severity="error">{this.state.errorMessage}</Alert>
//     )}
//     </div>
//     <Grid container className="filter">
//     <ToggleButtonGroup size="small" value={this.state.roomsFilter} onChange={this.roomFilterToogleRoom} aria-label="Room filter">
//     {this.state.roomsList.map((room, index) => (
//         <ToggleButton key={room['_id']} value={room.number} aria-label={room.number}>{room.number}</ToggleButton>
//     ))}
//     </ToggleButtonGroup>
//     </Grid>
//     <Grid container className="roomsList">
//     {this.state.events.map((event, index) => (
//         <Grid key={event.room._id} item md={6} sm={12}>
//         <EventsRoom data={event}/>
//         </Grid>
//     ))}
//     </Grid>
//     <div className="addEvent btnContainer">
//     <Button component={Link} to="/events/add" variant="contained" color="secondary" fullWidth type="submit" disabled={this.state.isLoading}>
//     Add event
//     </Button>
//     </div>
//     </Container>
// );
