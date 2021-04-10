import React from 'react';
import { Link } from "react-router-dom";
import BaseComponent from '../../components/BaseComponent'
import EventsRoom from '../../components/EventsRoom'
import {
    Button,
    Grid,
} from '@material-ui/core'

import {
    ToggleButtonGroup,
    ToggleButton,
} from '@material-ui/lab'

import Alert from '@material-ui/lab/Alert'

import { eventList as eventListApi } from '../../services/events'
import { list as roomsListApi } from '../../services/rooms'

import './index.scss';

class Events extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            events: [],
            roomsList: [],
            isLoading: false,
            errorMessage: '',
            roomsFilter : [],
        }
        this.roomFilterToogleRoom = this.roomFilterToogleRoom.bind(this)
    }

    setLoading(state = false) {
        this.setState({isLoading: state});
    }

    componentDidMount() {
        this.getRoomList();

        let ymd = this.getDate()
        this.getEvents(ymd);
    }

    getDate() {
        return new Date().toISOString().substring(0, 10)
    }

    async getEvents(ymd, rooms) {
        this.setLoading(true);
        const eventsResp = await eventListApi(ymd, rooms);
        this.setLoading(false);
        if (eventsResp.error) {
            this.alert({errorMessage: 'Data loading fairule'})
            return;
        }
        else {
            if (!eventsResp.data?.data) {
                this.alert({errorMessage: 'Invalid data from server'})
                return;
            }
            this.setState({events: eventsResp.data.data.events})
            console.log(eventsResp.data.data)
        }
    }

    async getRoomList() {
        this.setLoading(true);
        const resp = await roomsListApi();
        this.setLoading(false);
        if (resp.error) {
            console.log('getRoomList error', resp)
            this.alert({errorMessage: 'Room list loading fairule'})
            return;
        }
        else {
            this.setState({roomsList: resp.data.data.rooms});
            console.log('getRoomList', resp.data.data.rooms)
        }
    }

    roomFilterToogleRoom(e, newFilter) {
        let currentFilter = this.state.roomsFilter
        this.setState({roomsFilter: newFilter})
        let ymd = this.getDate()
        this.getEvents(ymd, newFilter)
    }

    render() {
        return (
            <div className="events page">
            <h2>Events</h2>
            <div id="EventsMessages">
            {this.state.errorMessage && (
                <Alert className="rooms__alert" severity="error">{this.state.errorMessage}</Alert>
            )}
            </div>
            <Grid container className="filter">
                <ToggleButtonGroup size="small" value={this.state.roomsFilter} onChange={this.roomFilterToogleRoom} aria-label="Room filter">
                {this.state.roomsList.map((room, index) => (
                    <ToggleButton key={room['_id']} value={room.number} aria-label={room.number}>{room.number}</ToggleButton>
                ))}
                </ToggleButtonGroup>
            </Grid>
            <Grid container className="roomsList">
            {this.state.events.map((event, index) => (
                <Grid key={event.room._id} item md={6} sm={12}>
                <EventsRoom data={event}/>
                </Grid>
            ))}
            </Grid>
            <Grid container className="addEvent">
                <Button variant="contained" color="secondary" size="large" fullWidth type="submit" disabled={this.state.isLoading}>
                    <Link color="secondary" to="/events/add">new event</Link>
                </Button>
            </Grid>
            </div>
        );
    }
}

export default Events;
