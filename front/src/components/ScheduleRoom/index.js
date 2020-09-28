import React from 'react'

import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';

import {
    Container,
    Button,
    IconButton,
    ButtonGroup,
} from '@material-ui/core';

export default class ScheduleRoom extends React.Component {
	constructor(props) {
		super(props)
		this.data = this.props.data;
        this.statuses = {
            available: 'Available',
            reserved: 'Reserved',
            pending: 'Pending'
        }
        this.initStatus();
	}

    initStatus() {
        let statusNames = Object.keys(this.statuses);
        this.status = statusNames[Math.floor(Math.random()*statusNames.length)];
        this.initStatusText(this.status)
    }
    initStatusText(status) {
        if ('pending' === status) {
            this.statusText = 'Event pending in 10 min';
        }
        else {
            this.statusText = this.statuses[status]
        }
    }
	render() {
		return (
            <Container maxWidth="md" className="scheduleRoom available">
                <div className="scheduleRoom__wrapper">
                    <div className="scheduleRoom__info-wrapper">
                        <div className="scheduleRoom__status-bar"></div>
                        <div className="scheduleRoom__info-details-wrapper">
                            <div className="scheduleRoom__info-details">
                                <strong className="scheduleRoom__title">{this.data.room.title}</strong>
                                <div className="scheduleRoom__status-txt">{this.statusText}</div>
                            </div>
                            {/*
                                btn btn-dark
                            */
                            }
                            {'available' === this.status && (
                                <div className="scheduleRoom__buttons-wrapper">
                                    <Button
                                        type="button" variant="contained"
                                        size="small" color="primary"
                                        className="scheduleRoom__reserve">Reserve</Button>
                                </div>
                            )}
                            
                        </div>
                    </div>
                    <ButtonGroup color="primary" className="scheduleRoom__timeblocks">
                        <Button size="small" type="button" className="scheduleRoom__timeblock available" disabled>10:30</Button>
                        <Button size="small" type="button" className="scheduleRoom__timeblock available">11AM</Button>
                        <Button size="small" type="button" className="scheduleRoom__timeblock available">11:30</Button>
                        <Button size="small" type="button" className="scheduleRoom__timeblock available">12PM</Button>
                        <Button size="small" type="button" className="scheduleRoom__timeblock available">12:30</Button>
                        <IconButton className="scheduleRoom__timeblock next">
                            <ArrowForwardIosIcon/>
                        </IconButton>
                    </ButtonGroup>
                </div>
            </Container>
		);
	}
}