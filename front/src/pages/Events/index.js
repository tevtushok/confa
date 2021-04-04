import React from 'react';
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
import { roomList as roomListApi } from '../../services/rooms'

class Shedule extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            events: [],
            roomList: [],
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
            this.setState({events: eventsResp.data.data})
            //console.log(eventsResp.data.data)
        }
    }

    async getRoomList() {
        this.setLoading(true);
        const resp = await roomListApi();
        this.setLoading(false);
        if (resp.error) {
            this.alert({errorMessage: 'Room list loading fairule'})
            return;
        }
        else {
            if (!resp.data?.data) {
                this.alert({errorMessage: 'Invalid room list from server'})
                return
            }
            this.setState({roomList: resp.data.data});
            console.log('getRoomList', resp.data.data)
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
            <h2>Shedule</h2>
            <div id="SheduleMessages">
            {this.state.errorMessage && (
                <Alert className="rooms__alert" severity="error">{this.state.errorMessage}</Alert>
            )}
            </div>
            <div>
                <ToggleButtonGroup size="small" value={this.state.roomsFilter} onChange={this.roomFilterToogleRoom} aria-label="Room filter">
                {this.state.roomList.map((room, index) => (
                    <ToggleButton key={room._id} value={room.number} aria-label={room.number}>{room.number}</ToggleButton>
                ))}
                </ToggleButtonGroup>
            </div>
            <Grid container spacing={3} className="events">
            {this.state.events.map((event, index) => (
                <Grid key={event.room._id} item md={6} sm={12}>
                <EventsRoom data={event}/>
                </Grid>
            ))}
            </Grid>
            </div>
        );
    }


}

export default Shedule;
