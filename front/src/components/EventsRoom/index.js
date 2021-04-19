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
        this.timeLineData = this.props.timeLine;
        this.groupItems = this.timeLineData.groupItems;

        this.timeLine = {};
        this.prepTimeLine();


        // select current time
        this.nowIndex = this.timeLineData.nowIndex;
        this.nowLabel = this.timeLineData.nowLabel;
        this.selectedTime = this.timeLine[this.nowLabel];
    }

    scroll = (toRight = true) => {
        const fromTime = this.selectedTime.time;
        const timeButtons = this.timeLineRef.current.querySelector('.timeButtons');
        const scrollCurent = timeButtons.style.scrollLeft;
        const btnFrom = this.timeLineRef.current.querySelector(`button[data-time="${fromTime}"]`);
        let scrollStep = btnFrom.offsetWidth;
        if (!toRight) {
            scrollStep = (-scrollStep);
        }
        timeButtons.scrollLeft += scrollStep;
    };

    scrollToRight = (e) => {
        e.stopPropagation();
        this.scroll();
    }

    scrollToLeft = (e) => {
        e.stopPropagation();
        this.scroll(false);
    }

    prepTimeLine() {
        this.timeLine = {};
        let selected = null;
        this.timeLineData.items.forEach(item => {
            selected = null === selected ? true : false;
            let status = STATUSES.AVAILABLE;
            let crossedOrPengingEvent = null;
            if (this.roomHasEvents) {
                this.events.some(event => {
                    status = this.getStatus(item.date, event);
                    crossedOrPengingEvent = event;
                    return STATUSES.AVAILABLE !== status;
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

    componentDidMount() {
        window.addEventListener('resize', this.updateDimensions);
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    updateDimensions = () => {
        let timeButtonWidth = (window.innerWidth - 80) / 7;
        console.log(timeButtonWidth);
        this.setState({
            timeButtonWidth: timeButtonWidth
        });
    };

    changeTime = (time) => {
        // console.info('changeTime', time, this.timeLine[time]);
        this.selectedTime = this.timeLine[time];
    }

    isReservedByMe(event) {
        return !!Math.round(Math.random(0,1));
        // return event.user._id === this.props.userStore.user.id);
    }

    getStatus(time, event) {

        let timeToCompare = dayjs(time).second(0).millisecond(0);
        let dateStart = dayjs(event.date_start).second(0).millisecond(0);
        let dateEnd = dayjs(event.date_end).second(0).millisecond(0);
        let pendingTime = timeToCompare.add(30, 'minute');

        if (this.room.number === 401) {
            console.info(pendingTime, dateStart, dateEnd);
        }

        let isCrossed = timeToCompare >= dateStart && timeToCompare < dateEnd
        if (isCrossed) {
            return STATUSES.RESERVED;
        }

        let isPending = timeToCompare >= dateStart.subtract(30, 'minute') && pendingTime < dateEnd.add(30, 'minute');
        if(isPending) {
            return STATUSES.PENDING;
        }

        return STATUSES.AVAILABLE
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
        let selectedTime = this.selectedTime;
        const disabled = selectedTime.disabled;
        const status = selectedTime.status;
        const renderEventInfo = () => {
            switch(status) {
                case STATUSES.PENDING:
                    return (
                        <div className="pengindEvent">
                            <div>Event is comming soon</div>
                            <div>Start in: {EventHelper.dateFormatClient(selectedTime.event.date_start, 'HH:mm')}</div>
                            <div>Ends in: {EventHelper.dateFormatClient(selectedTime.event.date_end, 'HH:mm')}</div>
                        </div>
                    );
                    break;
                case STATUSES.RESERVED:
                    return (
                        <div className="roomReserved">
                            <div>Room is reserved</div>
                            <div>Start in: {EventHelper.dateFormatClient(selectedTime.event.date_start, 'HH:mm')}</div>
                            <div>Ends in: {EventHelper.dateFormatClient(selectedTime.event.date_end, 'HH:mm')}</div>
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
        const timeButtons = () => {
            let buttons = [];
            this.timeLineData.items.forEach((item, index) => {
                const time = item.time;
                const status = this.timeLine[time]['status'];
                const className = `timebtn ${status} ${this.timeLine[time].className}`;
                buttons.push(
                    <Button key={index} onClick={this.handleTimeClick} data-time={time} className={className}>
                    {time}
                    </Button>
                );
            });
            return <div className="timeButtons">{buttons}</div>;
        };
        const attrFrom = this.selectedTime.time;
        // console.log(this.selectedTime);
        // console.log(this.timeLineRef);
        // this.timeLineData.items.forEach(item => {
        //
        return (
            <ButtonGroup ref={this.timeLineRef} size="small" className="timeline" data-from={attrFrom}>
                <Button className="prev" onClick={this.scrollToLeft}>
                    <ArrowLeftIcon/>
                </Button>
                    {timeButtons()}
                <Button className="next" onClick={this.scrollToRight}>
                    <ArrowRightIcon/>
                </Button>
            </ButtonGroup>
        );
    }
}
export default EventsRoom;


