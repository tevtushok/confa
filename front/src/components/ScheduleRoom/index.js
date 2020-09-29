import React from 'react'
import { useTheme } from '@material-ui/core/styles';

import {
    ArrowLeft as ArrowLeftIcon,
    ArrowRight as ArrowRightIcon,
} from "@material-ui/icons";

import {
    Container,
    Button,
    IconButton,
    ButtonGroup,
} from '@material-ui/core';

import './index.scss'

function StatusBar(props) {
    const theme = useTheme();
    console.log(theme)
    return <div className={`scheduleRoom__status-bar ${props.status}`}></div>
}

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
    isReservedByMe() {
        return !!Math.round(Math.random(0,1));
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
            <div className={`scheduleRoom ${this.status}`}>
                <div className="scheduleRoom__wrapper">
                    <div className="scheduleRoom__info-wrapper">
                        <StatusBar status={this.status}/>
                        <div className="scheduleRoom__info-details-wrapper">
                            <div className="scheduleRoom__info-details">
                                <strong className="scheduleRoom__title">{this.data.room.title}</strong>
                                <div className="scheduleRoom__status-txt">{this.statusText}</div>
                                {'available' !== this.status && (
                                    <div>
                                        <div class="room_reserved_title">Hello freak bithes</div>
                                        <div class="room_reserved_by">Somebody</div>
                                        <div class="room_reserved_by">10:00am - 10:00am</div>
                                    </div>
                                )}
                                </div>
                                <div className="scheduleRoom__buttons-wrapper">
                                {'available' === this.status && (
                                    <Button
                                        type="button" variant="contained"
                                        size="small" color="primary"
                                        className="scheduleRoom__reserve">Reserve</Button>
                                )}
                                </div>

                        </div>
                    </div>
                    <ButtonGroup fullWidth size="small" class="scheduleRoom__timeblocks">
                        <IconButton>
                            <ArrowLeftIcon/>
                        </IconButton>
                        <Button className="scheduleRoom__timebtn unavailable" disabled>10:30</Button>
                        <Button className="scheduleRoom__timebtn unavailable">11AM</Button>
                        <Button className="scheduleRoom__timebtn available">11:30</Button>
                        <Button className="scheduleRoom__timebtn available">12PM</Button>
                        <Button className="scheduleRoom__timebtn available">12:30</Button>
                        <Button className="scheduleRoom__timebtn available">13PM</Button>
                        <Button className="scheduleRoom__timebtn available">13:30</Button>
                        <IconButton>
                            <ArrowRightIcon/>
                        </IconButton>
                    </ButtonGroup>
                </div>
            </div>
		);
	}
}