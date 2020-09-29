import React from 'react';
import BaseComponent from '../../components/BaseComponent';
import ScheduleRoom from '../../components/ScheduleRoom'
import {
  Button,
  Grid,
  Paper
} from '@material-ui/core'

import Alert from '@material-ui/lab/Alert'

import { getListRoom as getListRoomApi } from '../../services/schedule'

class Shedule extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      rooms: [],
      isLoading: false,
      errorMessage: '',
    }
  }

  setLoading(state = false) {
    this.setState({isLoading: state});
  }

  componentDidMount() {
    this.getEvents();
  }

  async getEvents() {
    this.setLoading(true);
    const eventsResp = await getListRoomApi();
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
      this.setState({rooms: eventsResp.data.data})
      console.log(eventsResp.data.data)
    }
  }

  render() {
    const rooms = this.state.rooms;
    return (
      <div className="schedule page">
        <h2>Shedule</h2>
        <div id="SheduleMessages">
          {this.state.errorMessage && (
            <Alert className="rooms__alert" severity="error">{this.state.errorMessage}</Alert>
          )}
        </div>
        <Grid container spacing={3} className="schedule__rooms">
        {this.state.rooms.map((room, index) => (
          <Grid key={room.room._id} item md={6} sm={12}>
            <ScheduleRoom data={room}/>
          </Grid>
        ))}
        </Grid>
      </div>
    );
  }


}

export default Shedule;
