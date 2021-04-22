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

        this.state = {
            redirectToAdd: null,
        };

        this.room = props.room;
        this.timeLineData = this.props.timeLine;

        this.stepMinutes = this.props.stepMinutes;

        this.date = this.props.date;

        this.timeLineRef = React.createRef();

        this.nowIndex = this.timeLineData.nowIndex;
        this.nowLabel = this.timeLineData.nowLabel;

        this.timeLine = this.prepTimeLine(this.room.events);

        // select current time
        this.selectedTime = this.timeLine[this.nowLabel];
        this.nowIndex -= 1;
        this.firstVisibleTimeIndex = this.nowIndex;

        this.initTimeData();
    }

    initTimeData() {
        this.timeData = {
            timeIndex1: NaN,
            timeIndex2: NaN,
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        console.warn('shouldComponentUpdate', JSON.stringify(nextProps));
        console.log(nextProps.room, this.props.room);
        console.warn('');
        if (this.props.room.events.length !== nextProps.room.events.length) {
            let ids = this.props.room.events.map(event => event._id).join(',');
            let newIds = nextProps.room.events.map(event => event._id).join(',');
            const shouldUpdate = (ids !== newIds);
            if (shouldUpdate) {
                this.onDataChange(nextProps);
            }
            return shouldUpdate;
        }
        if (this.props.date !== nextProps.date) {
            this.onDataChange(nextProps);
            return true;
        }
        return false;
    }

    onDataChange = (nextProps) => {
        this.date = nextProps.date;
        this.timeLine = this.prepTimeLine(nextProps.room.events);
        this.timeLineData = nextProps.timeLine;
        this.selectedTime = this.timeLine[this.nowLabel];
        this.initTimeData();
        this.resetSelections();
    }

    resetSelections() {
        this.setIntermediate();
        const buttons = this.timeLineRef.current.querySelectorAll('.selected, .postData');
        if (buttons) {
            buttons.forEach(button => {
                button.classList.remove('selected');
                button.classList.remove('postData');
            });
        }
    }

    componentDidMount() {
        this.resizeTimeButtons();
        this.setTimeLineLeft();

        const timeButtons = this.timeLineRef.current.querySelector('.buttonsWrapper');
        setTimeout(() => {
            timeButtons.classList.remove('loading');
        },0);

        window.addEventListener('resize', this.onRezise);
    }

    onRezise = () => {
        this.resizeTimeButtons();
        this.setTimeLineLeft();
    };

    componentWillUnmount() {
        window.removeEventListener('resize', this.onRezise);
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

    prepTimeLine(events = []) {
        let timeLine = {};
        this.timeLineData.items.forEach(item => {
            let status = STATUSES.AVAILABLE;
            let crossedOrPengingEvent = null;
            if (events.length) {
                events.some(event => {
                    status = this.getStatus(item.date, event);
                    crossedOrPengingEvent = event;
                    return STATUSES.AVAILABLE !== status;
                });
            }
            const selected = this.nowLabel === item.label;
            timeLine[item.label] = {
                label: item.label,
                date: item.date,
                event: crossedOrPengingEvent,
                status: status,
                className: selected ? 'selected' : '',
                disabled: status !== STATUSES.AVAILABLE,
            };
        });
        return timeLine;
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

    setIntermediate = () => {
        this.timeLineRef.current.querySelectorAll('.timebtn').forEach((btn, index) => {
            if (this.timeData.timeIndex1 && index >= this.timeData.timeIndex1
                && this.timeData.timeIndex2 && index <= this.timeData.timeIndex2) {
                btn.classList.add('intermediate');
            }
            else {
                btn.classList.remove('intermediate');
            }
        });
    };

    setTimeData(clickedBtn) {
        let status = clickedBtn.dataset.status
        let index = clickedBtn.dataset.index;
        if (status !== STATUSES.AVAILABLE) {
            return;
        }

        if (index === this.timeData.timeIndex1) {
            this.timeData.timeIndex1 = NaN;
            clickedBtn.classList.remove('postData');
        }
        else if (index === this.timeData.time2) {
            this.timeData.timeIndex2 = NaN;
            clickedBtn.classList.remove('postData');
        }

        else if(isNaN(this.timeData.timeIndex1)) {
            this.timeData.timeIndex1 = index;
            clickedBtn.classList.add('postData');
        }
        else if (isNaN(this.timeData.timeIndex2)) {
            this.timeData.timeIndex2 = index;
            clickedBtn.classList.add('postData');
            this.setIntermediate();
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
            this.setIntermediate();
        }
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

        let isCrossed = timeToCompare >= dateStart && timeToCompare < dateEnd
        if (isCrossed) {
            return STATUSES.RESERVED;
        }

        let isPending = timeToCompare >= dateStart.subtract(this.stepMinutes - 1, 'minute') && timeToCompare < dateEnd;
        if(isPending) {
            return STATUSES.PENDING;
        }

        return STATUSES.AVAILABLE
    }
    render() {
        console.warn('render', this.props.room.number, this.props.room.events.length);
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
                            <div>Start in: {EventHelper.dateFormatClient(selectedTime.event.date_start, 'DD-MM-YYYY HH:mm')}</div>
                            <div>Ends in: {EventHelper.dateFormatClient(selectedTime.event.date_end, 'HH:mm')}</div>
                        </div>
                    );
                case STATUSES.RESERVED:
                    return (
                        <div className="roomReserved">
                            <div>Room is reserved</div>
                            <div>Start in: {EventHelper.dateFormatClient(selectedTime.event.date_start, 'DD-MM-YYYY HH:mm')}</div>
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
        const buttonProps = (item, index) => {
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

        console.log('');
        console.log('');
        console.log(this.room.number);
        console.log(this.timeLine);

        return(
            <div ref={this.timeLineRef} className="timeline">
                <Button className="prev" onClick={this.scrollToLeft}>
                    <ArrowLeftIcon/>
                </Button>
                <div className="buttonsWrapper loading">
                    <div className="timeButtons">
                        {this.timeLineData.items.map((item, index) => (
                            <Button {...buttonProps(item, index)}>{item.label}</Button>
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
