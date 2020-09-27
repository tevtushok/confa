import React from 'react';

import { getListRoom as getListRoomApi } from '../../services/schedule'

class Shedule extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      eventList: [],
      isLoading: false,
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
    console.log(eventsResp)
    this.setLoading(false);
  }

  render() {
    return (
      <div className="schedule component">
      <h3>Shedule</h3>
      </div>
    );
  }


}

export default Shedule;
