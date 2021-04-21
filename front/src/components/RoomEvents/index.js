import React from 'react'
import { Redirect } from 'react-router-dom';

import { inject } from 'mobx-react';
import dayjs from 'dayjs';

import {
    ArrowLeft as ArrowLeftIcon,
    ArrowRight as ArrowRightIcon,
} from "@material-ui/icons";

import { Button, } from '@material-ui/core';

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

        this.nowIndex = this.timeLineData.nowIndex;
        this.nowLabel = this.timeLineData.nowLabel;

        this.timeLine = {};
        this.prepTimeLine();

        // select current time
        this.selectedTime = this.timeLine[this.nowLabel];
        this.nowIndex -= 1;
        this.firstVisibleTimeIndex = this.nowIndex;

        this.state = {
            redirectToAdd: null,
        }

        this.timeData = {
            timeIndex1: NaN,
            timeIndex2: NaN,
        };
    }

    componentDidMount() {
        this.resizeTimeButtons();
        this.setTimeLineLeft();
        window.addEventListener('resize', this.resizeTimeButtons);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeTimeButtons);
    }

    getTimeButtonWidth = () => {
        let timeline = this.timeLineRef.current;
        let timeButtonsWidth = timeline.querySelector('.buttonsWrapper').offsetWidth;

        const buttonsCount = 1 + parseInt(timeButtonsWidth / 100);

        let width = parseFloat(timeButtonsWidth / buttonsCount);
        return width;
    };

    setTimeLineLeft(buttonWidth = null) {
        const timeButtons = this.timeLineRef.current.querySelector('.timeButtons');
        let left = 0;
        let buttons = this.timeLineRef.current.querySelectorAll('.timebtn');
        [].some.call(buttons, (button, btnIndex) => {
            left += button.offsetWidth;
            return this.firstVisibleTimeIndex === btnIndex;
        });

        timeButtons.style.left = -left + 'px';
    }

    resizeTimeButtons = () => {
        const buttonWidth = this.getTimeButtonWidth();
        this.timeLineRef.current.querySelectorAll('.timebtn').forEach(item => {
            item.style.minWidth = buttonWidth + 'px';
            item.style.maxWidth = buttonWidth + 'px';
            item.style.width = buttonWidth + 'px';
        });
        this.setTimeLineLeft();
    };

    scroll = (toRight = true) => {
        const fromTime = this.selectedTime.label;
        const timeButtons = this.timeLineRef.current.querySelector('.timeButtons');
        const buttonsWrapper = this.timeLineRef.current.querySelector('.buttonsWrapper');
        const prevBtn = this.timeLineRef.current.querySelector('.prev');
        const nextBtn = this.timeLineRef.current.querySelector('.next');
        let currentPos = parseInt(timeButtons.style.left) || 0;
        let newPos = null;
        const btnFrom = this.timeLineRef.current.querySelector(`button[data-label="${fromTime}"]`);
        let scrollStep = btnFrom.offsetWidth;

        newPos = toRight ? currentPos - scrollStep : currentPos + scrollStep;

        let leftPosLimit = 0;
        // let rightPosLimit = timeButtons.offsetWidth + prevBtn.offsetWidth + nextBtn.offsetWidth;
        let rightPosLimit = timeButtons.offsetWidth - buttonsWrapper.offsetWidth;

        if (newPos >= leftPosLimit) {
            newPos = 0;
            prevBtn.setAttribute('disabled', true);
        }
        else {
            prevBtn.removeAttribute('disabled');
        }

        if (Math.abs(newPos) >= rightPosLimit ) {
            newPos = (-rightPosLimit);
            nextBtn.setAttribute('disabled', true);
        }
        else {
            nextBtn.removeAttribute('disabled');
        }

        timeButtons.style.left = newPos + 'px';

    };

    scrollToRight = (e) => {
        e.stopPropagation();
        this.firstVisibleTimeIndex++;
        this.scroll();
    }

    scrollToLeft = (e) => {
        e.stopPropagation();
        this.firstVisibleTimeIndex--;
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
            const selected = this.nowLabel === item.label;
            this.timeLine[item.label] = {
                label: item.label,
                date: item.date,
                event: crossedOrPengingEvent,
                status: status,
                className: selected ? 'selected' : '',
                disabled: status !== STATUSES.AVAILABLE,
            };
        });
    }

    handleTimeClick = (e) => {
        const selected = this.timeLineRef.current.querySelector('.selected');
        if (selected) {
            selected.classList.remove('selected');
        }
        const label = e.currentTarget.dataset.label;
        e.currentTarget.classList.add('selected');
        this.setTimeData(e.currentTarget);
        this.changeTime(label);
    };

    setTimeData(clickedBtn) {
        let status = clickedBtn.dataset.status
        let index = clickedBtn.dataset.index;
        console.log(status, index);
        if (status !== STATUSES.AVAILABLE) {
            return;
        }
        const setIntermediate = () => {
            this.timeLineRef.current.querySelectorAll('.timebtn').forEach((btn, index) => {
                if (index >= this.timeData.timeIndex1 && index <= this.timeData.timeIndex2) {
                    btn.classList.add('intermediate');
                }
                else {
                    btn.classList.remove('intermediate');
                }
            });
        };

        if (index === this.timeData.timeIndex1) {
            console.log(1);
            this.timeData.timeIndex1 = NaN;
            clickedBtn.classList.remove('postData');
        }
        else if (index === this.timeData.time2) {
            console.log(11);
            this.timeData.timeIndex2 = NaN;
            clickedBtn.classList.remove('postData');
        }

        else if(isNaN(this.timeData.timeIndex1)) {
            console.log(111);
            this.timeData.timeIndex1 = index;
            clickedBtn.classList.add('postData');
        }
        else if (isNaN(this.timeData.timeIndex2)) {
            console.log(1111);
            this.timeData.timeIndex2 = index;
            clickedBtn.classList.add('postData');
            setIntermediate();
        }

        else {
            let prevBtn = null;
            if (index < this.timeData.timeIndex1) {
                prevBtn = this.timeLineRef.current.querySelector(`.timebtn[data-index="${this.timeData.timeIndex1}"]`);
                this.timeData.timeIndex1 = index;
            }
            else if (index > this.timeData.timeIndex1) {
                prevBtn = this.timeLineRef.current.querySelector(`.timebtn[data-index="${this.timeData.timeIndex2}"]`);
                this.timeData.timeIndex2 = index;
            }
            prevBtn.classList.remove('postData');
            clickedBtn.classList.add('postData');
            setIntermediate();
        }
        console.log(clickedBtn);
        console.log(this.timeData);
    }

    changeTime = (label) => {
        this.selectedTime = this.timeLine[label];
        this.setState({ selectedTime: this.selectedTime });
    }

    isReservedByMe(event) {
        return !!Math.round(Math.random(0,1));
        // return event.user._id === this.props.userStore.user.id);
    }

    handleAddEvent = () => {
        let args = [ this.room._id];
        const timeIndexes = Object.values(this.timeData).filter(time => time);
        timeIndexes.forEach(index => {
            args.push(this.timeLineData.items[index].label);
        });
        const link = '/events/add/' + args.join('/');
        this.setState({ redirectToAdd: link });
    };

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
    render() {
        if (this.state.redirectToAdd) {
            return <Redirect to={this.state.redirectToAdd}/>
        }
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
        const room = this.room;
        let selectedTime = this.selectedTime;
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
                case STATUSES.RESERVED:
                    return (
                        <div className="roomReserved">
                            <div>Room is reserved</div>
                            <div>Start in: {EventHelper.dateFormatClient(selectedTime.event.date_start, 'HH:mm')}</div>
                            <div>Ends in: {EventHelper.dateFormatClient(selectedTime.event.date_end, 'HH:mm')}</div>
                        </div>
                    );
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
                        <Button onClick={this.handleAddEvent} variant="contained" color="primary" fullWidth type="submit" className="addEvent">Add event</Button>
                    </div>
                    )}
                </div>
            </div>
        );
    }

    TimeLine() {
        const buttonProps = (index, item) => {
            const label = item.label;
            const status = this.timeLine[label]['status'];
            const className = `timebtn ${status} ${this.timeLine[label].className}`;
            return {
                id: `${this.room.number}-scrollable-auto-tab-${index}`,
                'aria-controls': `${this.room.number}-scrollable-auto-tab-${index}`,
                'aria-label': label,
                key: index,
                'data-label': label,
                'data-index': index,
                'data-status': status,
                label: item.label,
                className: className,
                onClick: this.handleTimeClick,
            };
        };

        return(
            <div ref={this.timeLineRef} className="timeline">
                <Button className="prev" onClick={this.scrollToLeft}>
                    <ArrowLeftIcon/>
                </Button>
                <div className="buttonsWrapper">
                    <div className="timeButtons">
                        {this.timeLineData.items.map((item, index) => (
                            <Button {...buttonProps(index, item)}>{item.label}</Button>
                        ))}
                    </div>
                </div>
                <Button className="next" onClick={this.scrollToRight}>
                    <ArrowRightIcon/>
                </Button>
            </div>
        );
    }
}
export default RoomEvents;
