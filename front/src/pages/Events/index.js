import React from 'react';
import { Link } from "react-router-dom";
import BaseComponent from '../../components/BaseComponent'
import EventsRoom from '../../components/EventsRoom'
import Bayan from '../../components/Bayan'
import {
    Button,
    Grid,
    Container,
} from '@material-ui/core'

import {
    ToggleButtonGroup,
    ToggleButton,
} from '@material-ui/lab'

import Alert from '@material-ui/lab/Alert'

// import { eventList as eventListApi } from '../../services/events'
// import { list as roomsListApi } from '../../services/rooms'
import roomsApi from '../../services/roomsApi'
import eventsApi from '../../services/eventsApi';

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
            pageLoaded: false,
        }
        this.roomFilterToogleRoom = this.roomFilterToogleRoom.bind(this)
    }

    setLoading(state = false) {
        this.setState({isLoading: state});
    }

    async componentDidMount() {
        await this.getRoomList();

        let ymd = this.getDate()
        await this.getEvents(ymd);
        this.setState({pageLoaded: true});
    }

    getDate() {
        return new Date().toISOString().substring(0, 10)
    }

    async getEvents(ymd, rooms) {
        this.setLoading(true);
        const eventsResp = await eventsApi.list(ymd, rooms);
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
        const result = await roomsApi.list();
        const apiCode = result.response.getApiCode();
        const apiData = result.response.getApiData();
        const apiMessage = result.response.getApiMessage();
        this.setLoading(false);
        if (result.error) {
            console.log('getRoomList error', result.error)
            this.alert({errorMessage: 'Room list loading fairule'})
            return;
        }
        else {
            this.setState({roomsList: apiData.rooms});
            console.log('getRoomList', apiData.rooms)
        }
    }

    roomFilterToogleRoom(e, newFilter) {
        let currentFilter = this.state.roomsFilter
        this.setState({roomsFilter: newFilter})
        let ymd = this.getDate()
        this.getEvents(ymd, newFilter)
    }

    render() {
        if (!this.state.pageLoaded) {
            return (
                <Container maxWidth="md" className="deleteEvent page loading">
                    <Bayan/>
                </Container>
            );
        }
        return (
            <Container maxWidth="md" className="events page">
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
                <div className="addEvent btnContainer">
                    <Button component={Link} to="/events/add" variant="contained" color="secondary" fullWidth type="submit" disabled={this.state.isLoading}>
                        Add event
                    </Button>
                </div>
            </Container>
        );
    }
}

export default Events;
