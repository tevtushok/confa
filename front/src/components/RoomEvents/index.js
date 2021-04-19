import React from 'react'
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

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
class RoomEvents extends React.Component {

    constructor(props) {
        super(props);
        this.room = this.props.room;
        this.events = this.props.room.events;
        this.roomHasEvents = Array.isArray(this.events) && this.events.length;

        this.timeLineRef = React.createRef();
        this.timeLineData = this.props.timeLine;
        this.groupItems = this.timeLineData.groupItems;

        this.nowIndex = this.timeLineData.nowIndex;
        this.nowLabel = this.timeLineData.nowLabel;

        this.timeLine = {};
        this.prepTimeLine();


        // select current time
        this.selectedTime = this.timeLine[this.nowLabel];
        this.state = {
            selectedTimeIndex: this.nowIndex,
        };
    }

    componentDidMount() {
        // this.resizeTimeButtons();
        window.addEventListener('resize', this.resizeTimeButtons);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeTimeButtons);
    }

    getTimeButtonWidth = () => {
        let timeline = this.timeLineRef.current;
        let timeButtonsContainerWidth = timeline.clientWidth;

        timeline.querySelectorAll('.MuiTabs-scrollButtons').forEach(scroll => {
            timeButtonsContainerWidth -= scroll.clientWidth;
        });

        let buttonWidth = timeButtonsContainerWidth / 7;
        return buttonWidth;
    };

    resizeTimeButtons = () => {
        const buttonWidth = this.getTimeButtonWidth();
        this.timeLineRef.current.querySelectorAll('.timebtn').forEach(item => {
            item.style.minWidth = buttonWidth + 'px';
            item.style.maxWidth = buttonWidth + 'px';
            item.style.width = buttonWidth + 'px';
        });
        let selectedButton = this.timeLineRef.current.querySelector('.timebtn.selectedq');
        if (selectedButton) {
            selectedButton.click();
        }
    };

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
        this.timeLineData.items.forEach(item => {
            let status = STATUSES.AVAILABLE;
            let crossedOrPengingEvent = null;
            if (this.roomHasEvents) {
                this.events.some(event => {
                    status = this.getStatus(item.date, event);
                    crossedOrPengingEvent = event;
                    return STATUSES.AVAILABLE !== status;
                });
            }
            const selected = this.nowLabel === item.time;
            this.timeLine[item.time] = {
                time: item.time,
                date: item.date,
                event: crossedOrPengingEvent,
                status: status,
                className: selected ? 'selectedq' : '',
                disabled: status !== STATUSES.AVAILABLE,
            };
        });
    }

    handleTimeClick = (e, index) => {
        const selected = this.timeLineRef.current.querySelector('.selectedq');
        if (selected) {
            selected.classList.remove('selectedq');
        }
        e.currentTarget.classList.add('selectedq');
        console.log(e, index);
        const time = this.timeLineData.items[index].time;
        this.changeTime(time);
    };

    changeTime = (time) => {
        // console.info('changeTime', time, this.timeLine[time]);
        this.selectedTime = this.timeLine[time];
        this.setState({ selectedTime: this.selectedTime });
        console.log(this.selectedTime);
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
            <div className={`roomEvents mdc-theme--primary-bg`}>
                <div className="baseWrapper">
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
            <div className="infoWrapper">
                <div className={`statusBar ${status}`}></div>
                <div className="detailsWrapper">
                    <div className="details">
                        <div className="number">Number: <strong>{room.number}</strong></div>
                        <div className="title">Title: <strong>{room.title}</strong></div>
                        <div className="status">Status: {status}</div>
                    </div>
                    {renderEventInfo()}
                    {status === STATUSES.AVAILABLE && (
                    <div className="addEventWrapper">
                        <Button variant="contained" color="primary" fullWidth type="submit" className="addEvent">Add event</Button>
                    </div>
                    )}
                </div>
            </div>
        );
    }

    TimeLine() {
        const tabProps = (index, item) => {
            const time = item.time;
            const status = this.timeLine[time]['status'];
            const className = `timebtn ${status} ${this.timeLine[time].className}`;
            return {
                id: `scrollable-auto-tab-${index}`,
                'aria-controls': `scrollable-auto-tabpanel-${index}`,
                key: index,
                label: item.time,
                className: className,
            };
        };
        return (
            <Tabs
                value={this.state.selectedTimeIndex}
                indicatorColor="primary"
                onChange={this.handleTimeClick}
                textColor="primary"
                variant="scrollable"
                scrollButtons="auto"
                ref={this.timeLineRef}
                className="timeline"
            >
            {this.timeLineData.items.map((item, index) => (
                <Tab {...tabProps(index, item)} />
            ))}
            </Tabs>
        );
    }
}
export default RoomEvents;
