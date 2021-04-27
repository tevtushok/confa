import React from 'react';
import { Link as routerLink } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import {
    Grid,
    Container,
    Link,
} from '@material-ui/core'
import { EventHelper } from '../../includes/modelsHelpers';
import ServerError from '../../components/ServerError';
import AppError from '../../components/AppError';
import Bayan from '../../components/Bayan';
import { RENDER_STATES } from '../../stores/profileStore';

import './index.scss';


@inject('profileStore')
@observer
class Profile extends React.PureComponent {
    async componentDidMount() {
        this.props.profileStore.loadProfile();
    }
    renderEventList = () => {
        let spacing = 4;
        let events = '';
        if (!this.props.profileStore.events.length) {
            events = <p>You dont have any events</p>;
            spacing = 0;
        }
        else {
            events = (
                this.props.profileStore.events.map((event, index) => (
                    <Grid key={event._id} item sm={4} className="event">
                        <div>Room: {event.room.number}</div>
                        <div>Title: {event.title}</div>
                        <div>Date start: {EventHelper.dateFormatClient(event.date_start)}</div>
                        <div>Date start: {EventHelper.dateFormatClient(event.date_end)}</div>
                        <div>
                            <div>Status: {event.status}</div>
                            <Link component={routerLink} variant="inherit" to={`/events/change/${event._id}`}>change</Link>&nbsp;|&nbsp;
                            <Link component={routerLink} variant="inherit" to={`/events/delete/${event._id}`}>delete</Link>
                        </div>
                    </Grid>
                ))
            );
        }
        return (
            <div className="events">
                <h3>Events</h3>
                <Grid container className="eventsList" spacing={spacing}>
                    {events}
                </Grid>
            </div>
        );
    }
    render() {
        console.info('render profile page', this.props.profileStore.renderState)
        let component = null;
        switch(this.props.profileStore.renderState) {
            case RENDER_STATES.INIT:
                component = <Bayan/>;
                    break;
            case RENDER_STATES.COMMON:
                component = this.renderEventList();
                break;
            case RENDER_STATES.FAILURE:
                component = <ServerError data="Server error"/>;
                break;
            default:
                component = <AppError data="Application error"/>;
        }
        return (
            <Container maxWidth="md" className={`profile page ${this.props.profileStore.renderState}`}>
                {component}
            </Container>
        );
    }

}

export default Profile;
