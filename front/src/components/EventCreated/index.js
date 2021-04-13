import React from 'react';
import { Link as routerLink } from 'react-router-dom';
import { Link, } from '@material-ui/core';
import dayjs from 'dayjs';

export default class EventCreated extends React.Component {
    render() {
        const dateStart = dayjs(this.props.event.date_start).format('DD-MM-YYYY HH:mm');
        console.log('EventCreated props', this.props);
        return (
            <div className="created text-center">
                <h2>Event created successfuly in room #{this.props.event.room.number}.</h2>
                <p>Start in: {dateStart}</p>
                <p>Duration: {this.props.event.duration} minutes</p>
                <p>
                    You can <Link component={routerLink} variant="inherit" to={`/events/change/${this.props.event._id}`}>change</Link>&nbsp;or&nbsp;
                    <Link component={routerLink} variant="inherit" to={`/events/delete/${this.props.event._id}`}>delete</Link>
                </p>
            </div>
        );
    }
}