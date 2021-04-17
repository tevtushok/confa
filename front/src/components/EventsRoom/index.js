import React from 'react'
import { useTheme } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/core/styles';
import { inject } from 'mobx-react';
import dayjs from 'dayjs';

import {
    ArrowLeft as ArrowLeftIcon,
    ArrowRight as ArrowRightIcon,
} from "@material-ui/icons";

import {
    Button,
    IconButton,
    ButtonGroup,
} from '@material-ui/core';

import { EventHelper } from '../../includes/modelsHelpers';

import './index.scss';

const STATUSES = {
    AVAILABLE: 'available',
    RESERVED: 'reserved',
    PENDING: 'pending',
};


@inject('userStore')
class EventsRoom extends React.Component {

    constructor(props) {
        super(props);
        this.room = this.props.room;
        this.events = this.props.room.events;
        this.roomHasEvents = Array.isArray(this.events) && this.events.length;
        this.timeLineRef = React.createRef();

        // timeLineArray eg. [{time: '10:30', date: '2012-12-12 12:30'}]
        this.timeLineArray = this.props.timeLine;
        this.timeLine = {};
        this.prepTimeLine();


        // first time button is default selected
        this.selectedTime = this.timeLine[this.timeLineArray[0].time];
    }

    prepTimeLine() {
        this.timeLine = {};
        let selected = null;
        this.timeLineArray.forEach(item => {
            selected = null === selected ? true : false;
            let status = STATUSES.AVAILABLE;
            let crossedOrPengingEvent = null;
            if (this.roomHasEvents) {
                this.events.some(event => {
                    let result = this.getStatusWithEvent(item.date, event);
                    status = result.status;
                    crossedOrPengingEvent = result.event;
                    return STATUSES.AVAILABLE !== result.status;
                });
            }
            this.timeLine[item.time] = {
                time: item.time,
                date: item.date,
                event: crossedOrPengingEvent,
                status: status,
                className: selected ? 'selected' : '',
                disabled: status !== STATUSES.AVAILABLE,
            };
        });
    }

    handleTimeClick = (e) => {
        const time = e.currentTarget.dataset.time;
        const selected = this.timeLineRef.current.querySelector('.selected');
        if (selected) {
            selected.classList.remove('selected');
        }
        e.currentTarget.classList.add('selected');
        this.changeTime(time);
    };

    changeTime = (time) => {
        // console.info('changeTime', time, this.timeLine[time]);
        this.selectedTime = this.timeLine[time];
        this.setState({
            selectedTime: this.selectedTime,
        });
    }

    isReservedByMe(event) {
        return !!Math.round(Math.random(0,1));
        // return event.user._id === this.props.userStore.user.id);
    }

    getStatusWithEvent(time, event) {
        let result = {
            status: STATUSES.AVAILABLE,
            event: null,
        }

        let timeToCompare = dayjs(time).second(0).millisecond(0);
        let dateStart = dayjs(event.date_start).second(0).millisecond(0);
        let dateEnd = dayjs(event.date_end).second(0).millisecond(0);
        let pendingTime = timeToCompare.add(30, 'minute');

        if (this.room.number === 401) {
            console.info(pendingTime, dateStart, dateEnd);
        }
        let isCrossed = timeToCompare >= dateStart && timeToCompare < dateEnd
        // let isPending = pendingTime >= dateStart && pendingTime < dateEnd.add(30, 'minute');
        let isPending = timeToCompare >= dateStart.subtract(30, 'minute') && pendingTime < dateEnd.add(30, 'minute');

        if (isCrossed) {
            result.status = STATUSES.RESERVED;
            result.event = event;
        }
        else if(isPending) {
            result.status = STATUSES.PENDING;
            result.event = event;
        }

        return result;
    }
    debug(...data) {
        if (this.room.number <= 402) {
            console.info('debug', this.room.number);
            console.log(...data);
        }
    }
    render() {
        return (
            <div className={`eventsRoom mdc-theme--primary-bg ${this.status}`}>
                <div className="eventsRoom__wrapper">
                    {this.EventDetails()}
                    {this.TimeLine()}
                </div>
            </div>
        );
    }

    EventDetails() {
        // console.info('EventDetails')
        const room = this.room;
        let status = this.selectedTime.status;
        let disabled = this.selectedTime.disabled;
        const renderEventInfo = () => {
            switch(status) {
                case STATUSES.PENDING:
                    return (
                        <div className="pengindEvent">
                            <div>Event is comming soon</div>
                            <div>Start in: {EventHelper.dateFormatClient(this.selectedTime.event.date_start, 'HH:mm')}</div>
                            <div>Ends in: {EventHelper.dateFormatClient(this.selectedTime.event.date_end, 'HH:mm')}</div>
                        </div>
                    );
                    break;
                case STATUSES.RESERVED:
                    return (
                        <div className="roomReserved">
                            <div>Room is reserved</div>
                            <div>Start in: {EventHelper.dateFormatClient(this.selectedTime.event.date_start, 'HH:mm')}</div>
                            <div>Ends in: {EventHelper.dateFormatClient(this.selectedTime.event.date_end, 'HH:mm')}</div>
                        </div>
                    );
                    break;
                default:
                    return '';
            }
        };
        return(
            <div className="eventsRoom__info-wrapper">
                <div className={`statusBar ${status}`}></div>
                <div className="eventsRoom__info-details-wrapper">
                    <div className="eventsRoom__info-details">
                        <div className="eventsRoom__number">Number: <strong>{room.number}</strong></div>
                        <div className="eventsRoom__title">Title: <strong>{room.title}</strong></div>
                        <div className="eventsRoom__status-txt">Status: {status}</div>
                    </div>
                    {renderEventInfo()}
                    <div className="addEventWrapper">
                        <Button disabled={disabled} variant="contained" color="primary" fullWidth type="submit" className="addEvent">Add event</Button>
                    </div>
                </div>
            </div>
        );
        // else {
            // return(
            //     <div className="eventsRoom__info-wrapper">
            //         <div className={`statusBar ${status}`}></div>
            //         <div className="eventsRoom__info-details-wrapper">
            //             <div className="eventsRoom__info-details">
            //                 <div className="eventsRoom__number">Number: <strong>{room.number}</strong></div>
            //                 <div className="eventsRoom__title">Title: <strong>{room.title}</strong></div>
            //                 <div className="eventsRoom__status-txt">Status: {status}</div>
            //             </div>
            //             <div className="occupier">
            //                 <div className="name">Reserved by: <a href={event.user.name}>{event.user.name}</a></div>
            //                 <div className="date">Date start: {event.date_start}</div>
            //                 <div className="date">Date end: {event.date_end}</div>
            //             </div>
            //             <div className="addEventWrapper">
            //                 <Button className="addEvent">Add event</Button>
            //             </div>
            //         </div>
            //     </div>
            // );
        // }
    }

    TimeLine() {
        return (
            <ButtonGroup ref={this.timeLineRef} size="small" className="timeline">
                <Button className="prev">
                    <ArrowLeftIcon/>
                </Button>
                {this.timeLineArray.map((item, index) => (
                    <TimeButton handleTimeClick={this.handleTimeClick}
                        key={index} time={this.timeLine[item.time]}/>
                ))}
                <Button className="next">
                    <ArrowRightIcon/>
                </Button>
            </ButtonGroup>
        );
    }

}
export default EventsRoom;


function TimeButton(props) {
    // disabled={props.time.disabled}
    return (
        <Button onClick={props.handleTimeClick}
            data-time={props.time.time}
            className={`timebtn ${props.time.className}
                ${props.time.status} `}>
            {props.time.time}
        </Button>
    );
}
