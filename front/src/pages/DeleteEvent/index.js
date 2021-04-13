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
import eventsApi from '../../services/eventsApi';
import ApiDataTypeError from '../../services/error';
import CODES from '../../services/codes';
import Bayan from '../../components/Bayan'
import ServerError from '../../components/ServerError'

import './index.scss';
@inject('userStore')
@withRouter
class DeleteEvent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,
            serviceMessage: '',
            serverError: null,
            pageLoaded: false,
            event: null,
            deleted: null,
            permissionErr: false,
        }
        const eventId = this.props.match.params.id;
        console.log(this.props.match.params.id);
        this.eventId = eventId;
    }

    componentDidMount() {
        this.loadEventDetails();
    }

    setServerError(message, opts = {}) {
        const defaults = {
            serviceMessage: message,
            serverError: true,
            isLoading: false,
            pageLoaded: true,
        };
        const state = Object.assign(defaults, opts);
        this.setState(state);
    }

    async loadEventDetails() {
        this.setState({isLoading: true});
        const result = await eventsApi.getEvent(this.eventId);
        const apiData = result.response.getApiData();
        const apiCode = result.response.getApiCode();
        if (result.error) {
            if (result.error instanceof ApiDataTypeError) {
                console.error('ApiDataTypeError');
            }
            else if (404 === result.response.status) {
                this.setServerError('Event not found');
                console.log('Event not found');
            }
            if (apiCode === CODES.EVENTS.DETAILS_ID_REQUIRED) {
                this.setServerError('Event Id is required');
                console.log('eventId is required');
            }
            else if (apiCode === CODES.EVENTS.DETAILS_ID_INVALID) {
                this.setServerError('Invalid event Id');
                console.log('Invalid eventId');
            }
            else {
                this.setServerError('Invalid data from server');
                console.log('Invalid data from server');
            }
        }
        else {
            console.info(apiData.event.user._id);
            if ('object' !== typeof apiData.event) {
                this.setServerError('Invalid data from serverq');
                console.log('Invalid data. Expected object event');
                return;
            }
            else if (apiData.event.user._id !== this.props.userStore.user.id) {
                this.setServerError('Permission denined!');
                console.log('owner error', this.props.userStore.user.id, apiData.event.user._id);
                return;
            }
            else {
                const stateProps = {
                    serviceMessage: '',
                    event: apiData.event,
                    pageLoaded: true,
                };
                this.setState(stateProps);
            }
        }
        this.setState({isLoading: false});
    }

    handleDeleteEvent = async() => {
        this.setState({isLoading: true});
        console.log('handleDeleteEvent');
        const result = await eventsApi.deleteEvent(this.eventId);
        const apiMessage = result.response.getApiMessage();
        const apiCode = result.response.getApiCode();
        if (result.error) {
            if (apiCode === CODES.EVENTS.NOT_BELONG_TO_YOU) {
                this.setServerError('Permission denined!');
                console.log('permission error', apiMessage);
            }
            else {
                this.setServerError('Server error');
                console.log('server error', apiMessage);
            }
        }
        else {
            this.setState({deleted: true});
        }
        this.setState({isLoading: false});
    };

    render() {
        if (!this.state.pageLoaded) {
            return (
                <Container maxWidth="md" className="deleteEvent page loading">
                    <Bayan/>
                </Container>
            );
        }
        else if (this.state.serverError === true) {
            return (
                <Container maxWidth="md" className="deleteEvent page serverError">
                    <ServerError data={this.state.serviceMessage}/>
                </Container>
            );
        }
        else if (this.state.deleted) {
            console.info('deleted render');
            return (
                <Container maxWidth="md">
                    <div className="addEvent page details">
                        <div className="created text-center">
                            <h2>Event deleted successfuly.</h2>
                            <Grid container className="btnContainer">
                                <Button component={routerLink} to="/events/add" variant="contained" color="secondary" fullWidth type="submit">
                                    Add event
                                </Button>
                            </Grid>
                        </div>
                    </div>
                </Container>
            );
        }
        else {
            console.log('details render');
            return (
                <Container maxWidth="md" className="addEvent page details">
                    <h2 className="text-center">Are you sure to delete event?</h2>
                    <Grid className="eventDetails">
                        <p><b>Room#:</b> {this.state.event.room.number}</p>
                        <p><b>Title:</b> {this.state.event.title}</p>
                        <p><b>Description:</b> {this.state.event.description}</p>
                        <p><b>Starts at:</b> {dayjs(this.state.event.date_start).format('DD-MM-YYYY HH:mm')}</p>
                        <p><b>Ends at:</b> {dayjs(this.state.event.date_end).format('DD-MM-YYYY HH:mm')}</p>
                    </Grid>
                    <Grid container className="btnContainer">
                        <Button disabled={this.state.isLoading} className="btnAddEvent" variant="contained" fullWidth
                            type="button" color="secondary" onClick={this.handleDeleteEvent}>Delete event
                        </Button>
                        {this.state.isLoading && <Bayan/>}
                    </Grid>
                </Container>
            );
        }
    }
}

export default DeleteEvent;
