import React from 'react';
import { Link as routerLink } from 'react-router-dom';
import { withRouter } from "react-router";

import { inject } from 'mobx-react';
import dayjs from 'dayjs';
import {
    Container,
    Grid,
    Button,
} from '@material-ui/core';

import { Event } from '../../includes/models';

import eventsApi from '../../services/eventsApi';
import CODES from '../../services/codes';

import SaveEvent, { RENDER_STATES } from '../../components/SaveEvent';
import Bayan from '../../components/Bayan'
import NoRooms from '../../components/NoRooms';
import ServerError from '../../components/ServerError';
import AppError from '../../components/AppError';

import './index.scss';


@inject('userStore')
@withRouter
class DeleteEvent extends SaveEvent {
    constructor(props) {
        super(props)
        const eventId = this.props.match.params.id;
        const eventModel = new Event({
            _id: eventId,
        });
        this.state = { ...this.state, event: eventModel }
    }

    async componentDidMount() {
        this.setState({ isLoading: true, });
        const newProps = await this.loadEventDetails();
        this.setState({
            isLoading: false,
            ...newProps,
        });
    }

    deleteEvent = async() => {
        const result = await eventsApi.deleteEvent(this.state.event._id);
        const apiMessage = result.response.getApiMessage();
        const apiCode = result.response.getApiCode();
        if (result.error) {
            if (apiCode === CODES.EVENTS.NOT_BELONG_TO_YOU) {
                console.log('permission error', apiMessage);
                return this.getServerErrorState('Permission denined!');
            }
            else {
                console.log('server error', apiMessage);
                return this.getServerErrorState('Server error');
            }
        }
        else {
            return { renderState: RENDER_STATES.SAVED };
        }
    }

    handleDeleteEvent = async() => {
        console.log('handleDeleteEvent');
        this.setState({ isLoading: true });
        const newProps = await this.deleteEvent();
        this.setState({ isLoading: false, ...newProps });
    };

    render() {
        let component = null;
        switch(this.state.renderState) {
            case RENDER_STATES.INIT:
                component = <Bayan/>;
                break;
            case RENDER_STATES.NO_ROOMS:
                component = <NoRooms/>;
                break;
            case RENDER_STATES.FAILURE:
                component = <ServerError data={this.state.serviceMessage}/>;
                break;
            case RENDER_STATES.SAVED:
                component = <EventDeleted/>;
                break;
            case RENDER_STATES.COMMON:
                console.log(this.state.event);
                component = <DeleteComfirm handleDeleteEvent={this.handleDeleteEvent} isLoading={this.state.isLoading} event={this.state.event}/>;
                break;
            default:
                component = <AppError data="Application error"/>;
        }
        return (
            <Container maxWidth="md" className={`addEvent page ${this.state.renderState}`}>
                {component}
            </Container>
        );
    }
}

function DeleteComfirm(props) {
    return(
        <>
            <h2 className="text-center">Are you sure to delete event?</h2>
            <Grid className="eventDetails">
                <p><b>Room#:</b> {props.event.room.number}</p>
                <p><b>Title:</b> {props.event.title}</p>
                <p><b>Description:</b> {props.event.description}</p>
                <p><b>Date start:</b> {dayjs(props.event.date_start).format('DD-MM-YYYY HH:mm')}</p>
                <p><b>Date end:</b> {dayjs(props.event.date_end).format('DD-MM-YYYY HH:mm')}</p>
            </Grid>
            <Grid container className="btnContainer">
                <Button disabled={props.isLoading} className="btnAddEvent" variant="contained" fullWidth
                    type="button" color="secondary" onClick={props.handleDeleteEvent}>Delete event
                </Button>
                {props.isLoading && <Bayan/>}
            </Grid>
        </>
    );

}

function EventDeleted(props) {
    return(
        <>
            <div className="created text-center">
                <h2>Event deleted successfuly.</h2>
                <Grid container className="btnContainer">
                    <Button component={routerLink} to="/events/add" variant="contained" color="secondary" fullWidth type="submit">
                        Add event
                    </Button>
                </Grid>
            </div>
        </>
    );
}

export default DeleteEvent;
