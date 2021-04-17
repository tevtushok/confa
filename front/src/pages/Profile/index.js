import React from 'react';
import { Link as routerLink } from 'react-router-dom';
import {
    Button,
    Grid,
    Container,
    Link,
} from '@material-ui/core'
import eventsApi from '../../services/eventsApi';
import { EventHelper } from '../../includes/modelsHelpers';
import BaseComponent, { RENDER_STATES } from '../../components/BaseComponent';

class Profile extends BaseComponent {

    async componentDidMount() {
        this.setState({ isLoading: true, });
        const state = await this.loadMyEvents();
        this.setState({ ...state, isLoading: false });
    }

    async loadMyEvents() {
        const result = await eventsApi.getMyEvents();
        const apiCode = result.response.getApiCode();
        const apiData = result.response.getApiData();
        if (result.error) {
            return {
                events: [],
                renderState: RENDER_STATES.FAILURE,
            }
        }
        if (apiData) {
            return {
                events: apiData.events,
                renderState: RENDER_STATES.COMMON,
            };
        }
        else {
            return {
                events: [],
                renderState: RENDER_STATES.FAILURE,
            }

        }
    }
    render() {
        console.info('render profile page', this.state.renderState)
        let component = null;
        switch(this.state.renderState) {
            case RENDER_STATES.INIT:
                component = <div>loading...</div>;
                    break;
            case RENDER_STATES.COMMON:
                component = (
                    <Grid container className="events" spacing={4}>
                    {this.state.events.map((event, index) => (
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
                    ))}
                    </Grid>
                );
                break;
            case RENDER_STATES.FAILURE:
                component = <div>server error</div>;
                break;
            default:
                component = <div>app error</div>;
        }
        return (
            <Container maxWidth="md" className="profile page">
                {component}
            </Container>
        );
    }

}

export default Profile;
