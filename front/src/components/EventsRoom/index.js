import React from 'react'
import { useTheme } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/core/styles';

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

    const statusPaletteMap = {
        available: 'success',
        pending: 'warning',
        reserved: 'error'
    }

    const styleName = (props.status && props.status in statusPaletteMap) ? statusPaletteMap[props.status] : false;
    const bgColor = styleName ? theme.palette[styleName].main : 'red';
    const useStyles = makeStyles({
        root: {
            background: bgColor,
        },
    });
    const classes = useStyles();
    //console.log(theme)
    return <div className={`eventsRoom__status-bar ${classes.root}`}></div>;
    
}

function TimeButton(props) {
    const theme = useTheme();
    const statusPaletteMap = {
        available: 'success',
        unavailable: 'error',
    }

    const styleName = (props.status && props.status in statusPaletteMap) ? statusPaletteMap[props.status] : false;
    const borderColor = styleName ? theme.palette[styleName].main : 'red';
    const useStyles = makeStyles({
        root: {
            'border-bottom-color': borderColor,
        },
    });
    const classes = useStyles();
    return (
        <Button className={`eventsRoom__timebtn ${classes.root}`}>{props.time}</Button>
    );


}

export default class EventsRoom extends React.Component {
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
            this.statusText = 'Event starded in 10 min';
        }
        else {
            this.statusText = this.statuses[status]
        }
    }
	render() {
		return (
            <div className={`eventsRoom mdc-theme--primary-bg ${this.status}`}>
                <div className="eventsRoom__wrapper">
                    <div className="eventsRoom__info-wrapper">
                        <StatusBar status={this.status}/>
                        <div className="eventsRoom__info-details-wrapper">
                            <div className="eventsRoom__info-details">
                                <div className="eventsRoom__number">Number: <strong>{this.data.room.number}</strong></div>
                                <div className="eventsRoom__title">Title: <strong>{this.data.room.title}</strong></div>
                                <div className="eventsRoom__status-txt">Status: {this.statusText}</div>
                                {'available' !== this.status && (
                                    <div>
                                        <div className="room_reserved_title">Event title: Hello freak bithes</div>
                                        <div className="room_reserved_by">Reserved by: Somebody</div>
                                        <div className="room_reserved_by">Time: 10:00am - 10:00am</div>
                                    </div>
                                )}
                                </div>
                                <div className="eventsRoom__buttons-wrapper">
                                {'available' === this.status && (
                                    <Button
                                        type="button" variant="contained"
                                        size="small" color="primary"
                                        className="eventsRoom__reserve">Reserve</Button>
                                )}
                                </div>
                        </div>
                    </div>
                    <ButtonGroup size="small" className="eventsRoom__timeblocks">
                        <Button>
                            <ArrowLeftIcon/>
                        </Button>
                        <TimeButton time="10:30" status="unavailable"/>
                        <Button className="eventsRoom__timebtn unavailable">11AM</Button>
                        <Button className="eventsRoom__timebtn available">11:30</Button>
                        <Button className="eventsRoom__timebtn available">12PM</Button>
                        <Button className="eventsRoom__timebtn available">12:30</Button>
                        <Button className="eventsRoom__timebtn available">13PM</Button>
                        <Button className="eventsRoom__timebtn available">13:30</Button>
                        <Button>
                            <ArrowRightIcon/>
                        </Button>
                    </ButtonGroup>
                </div>
            </div>
		);
	}
}
