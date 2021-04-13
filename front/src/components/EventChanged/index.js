import React from 'react';
import dayjs from 'dayjs';

export default class EventCreated extends React.Component {
    render() {
        const dateStart = dayjs(this.state.eventStartDateTime).format('DD-MM-YYYY HH:mm');
        console.log('state', this.state.eventStartDateTime);
        console.log('dayjs', dateStart);
        return (
            <div className="created text-center">
                <h2>Event changed successfuly in room #{this.props.event.room.number}.</h2>
                <p>Start in: {dateStart}</p>
                <p>Duration: {this.props.event.duration} minutes</p>
            </div>
        );
    }
}
