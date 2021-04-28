import React from 'react'
import { Redirect } from 'react-router-dom';

import { inject } from 'mobx-react';
import dayjs from 'dayjs';

import { Button, } from '@material-ui/core';
import {
    ArrowLeft as ArrowLeftIcon,
    ArrowRight as ArrowRightIcon,
} from "@material-ui/icons";

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
        this.timeLineRef = React.createRef();

        this.stepMinutes = this.props.stepMinutes;

        this.initDinamycProps(this.props);

        this.state = {
            redirectToAdd: null,
            selectedTime: this.timeLine[this.nowLabel],
        };
        this.mouseDownOnScrollInterval = false;
        this.isMouseHoldedOnScroll = false;
        this.prevWindowWidth = null;
    }

    initDinamycProps(props) {
        this.date = props.date;
        this.room = props.room;

        this.timeLineData = props.timeLine;
        this.nowLabel = this.timeLineData.nowLabel;
        this.timeLine = this.prepTimeLine(this.room.events);

        this.initTimeData();
    }

    setFirstVisibleIndex(index = false) {
        console.log('index:', index);
        if (!index) {
            index = this.timeLineData.nowIndex;
            console.log(' 1 index:', index);
        }
        if (index < 0) {
            index = 0;
            console.log(' 2 index:', index);
        }
        const buttonsCount = this.getVibisleTimeButtonsCount();
        if (index > this.timeLineData.items.length - buttonsCount) {
            index = this.timeLineData.items.length - buttonsCount;
            console.log(' 3 index:', index);
        }
        console.log('nowIndex:', this.timeLineData.nowIndex,
            'buttonsCount', buttonsCount);
        this.firstVisibleTimeIndex = index;
    }

    initTimeData() {
        this.timeData = {
            timeIndex1: NaN,
            timeIndex2: NaN,
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.room.events.length !== nextProps.room.events.length) {
            let ids = this.props.room.events.map(event => event._id).join(',');
            let newIds = nextProps.room.events.map(event => event._id).join(',');
            const shouldUpdate = (ids !== newIds);
            if (shouldUpdate) {
                this.onDataChange(nextProps);
            }
            return shouldUpdate;
        }

        if (dayjs(nextProps.date).isValid() && this.props.date !== nextProps.date) {
            this.onDataChange(nextProps);
            return true;
        }

        if (this.state.selectedTime.label !== nextState.selectedTime.label) {
            return true;
        }

        return true;
    }

    onDataChange = (nextProps) => {
        this.initDinamycProps(nextProps);
        this.setState({ selectedTime: this.timeLine[this.nowLabel] });
        this.resetSelections();// reset current selections
        this.setTimeLineLeft();
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
        this.setFirstVisibleIndex();
        this.resizeTimeButtons();
        this.setTimeLineLeft();

        const timeButtons = this.timeLineRef.current.querySelector('.buttonsWrapper');
        setTimeout(() => {
            timeButtons.classList.remove('loading');
        },0);
        this.prevWindowWidth = window.innerWidth;
        window.addEventListener('resize', this.onRezise);
    }

    onRezise = () => {
        if (this.prevWindowWidth !== window.innerWidth) {
            this.resizeTimeButtons();
            this.setTimeLineLeft();
            this.prevWindowWidth = window.innerWidth;
        }
    };

    componentWillUnmount() {
        window.removeEventListener('resize', this.onRezise);
    }

    getVibisleTimeButtonsCount() {
        const timeButtonsWidth = this.timeLineRef.current.querySelector('.buttonsWrapper').offsetWidth;
        const count = 1 + parseInt(timeButtonsWidth / 100);
        return count;
    }

    getTimeButtonWidth = () => {
        const timeButtonsWidth = this.timeLineRef.current.querySelector('.buttonsWrapper').offsetWidth;
        const buttonsCount = this.getVibisleTimeButtonsCount();
        let width = parseFloat(timeButtonsWidth / buttonsCount);
        return width;
    };

    setTimeLineLeft() {
        const timeButtons = this.timeLineRef.current.querySelector('.timeButtons');
        const timeButtonsWidth = this.timeLineRef.current.querySelector('.buttonsWrapper').offsetWidth;
        let left = 0;
        let rightPosLimit = timeButtons.offsetWidth - timeButtonsWidth;
        const buttonsCount = this.getVibisleTimeButtonsCount();
        console.log('buttonsCount', buttonsCount, 'firstVisibleTimeIndex', this.firstVisibleTimeIndex);
        // if last button is visible stick to right
        if (buttonsCount >= this.timeLineData.items.length - this.firstVisibleTimeIndex) {
            left = rightPosLimit;
            this.firstVisibleTimeIndex = this.timeLineData.items.length - buttonsCount;
            const firstVisibleButton = this.timeLineRef.current.querySelector(`.timebtn[data-index="${this.firstVisibleTimeIndex}"]`);
            firstVisibleButton.style.color = 'yellow';
            const nextBtn = this.timeLineRef.current.querySelector('.next');
            nextBtn.setAttribute('disabled', true);
            console.log('disable last');
        }
        else if (this.firstVisibleTimeIndex > 0) {
            let buttons = this.timeLineRef.current.querySelectorAll('.timebtn');
            [].some.call(buttons, (button, btnIndex) => {
                left += button.offsetWidth;
                return this.firstVisibleTimeIndex <= btnIndex;
            });
        }

        console.log(this.firstVisibleTimeIndex);

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
        const fromTime = this.state.selectedTime.label;
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

    scrollToRight = () => {
        this.firstVisibleTimeIndex++;
        this.scroll();
    }

    scrollToLeft = () => {
        this.firstVisibleTimeIndex--;
        this.scroll(false);
    }

    scrollSwitch = (direction) => {
        if (direction === 'left') {
            this.scrollToLeft();
        }
        else if (direction === 'right') {
            this.scrollToRight();
        }
    }

    handleScrollMouseDown = (e, direction) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        console.log('handleScrollMouseDown', direction);
        if (direction) {
            this.mouseDownOnScrollInterval = setInterval(() => {
                this.isMouseHoldedOnScroll = true;
                console.log('handleScrollMouseDown timer', direction);
                this.scrollSwitch(direction);
            }, 300);
        }
    }

    handleScrollMouseUp = (e, direction) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        if (!this.isMouseHoldedOnScroll) {
            this.scrollSwitch(direction);
        }
        this.isMouseHoldedOnScroll = false;
        clearInterval(this.mouseDownOnScrollInterval);
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
        e.currentTarget.classList.toggle('selected');
        const label = e.currentTarget.dataset.label;
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
            console.log('index === index1');
            clickedBtn.classList.remove('postData');
        }
        else if (index === this.timeData.timeIndex2) {
            this.timeData.timeIndex2 = NaN;
            console.log('index === index2');
            clickedBtn.classList.remove('postData');
        }

        else if(isNaN(this.timeData.timeIndex1)) {
            this.timeData.timeIndex1 = index;
            clickedBtn.classList.add('postData');
        }
        else if (isNaN(this.timeData.timeIndex2)) {
            this.timeData.timeIndex2 = index;
            clickedBtn.classList.add('postData');
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
        }
        this.setIntermediate();
    }

    changeTime = (label) => {
        this.setState({ selectedTime: this.timeLine[label] });
    }

    isReservedByMe(event) {
        return !!Math.round(Math.random(0,1));
        // return event.user._id === this.props.userStore.user.id);
    }

    handleAddEvent = () => {
        let args = [ this.room._id];
        const timeIndexes = Object.values(this.timeData).filter(time => time);
        timeIndexes.forEach(index => {
            args.push(
                dayjs(`${dayjs(this.date).format('YYYY-MM-DD')} ${this.timeLineData.items[index].label}`).format('YYYY-MM-DDTHH:mm')
            );
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
        if (this.state.redirectToAdd) {
            return <Redirect to={this.state.redirectToAdd}/>
        }
        console.info('  render RoomEvents room:', this.room.number);
        return (
            <div className={`roomEvents mdc-theme--primary-bg`}>
                <div className="baseWrapper">
                    <EventDetails onSubmit={this.handleAddEvent}
                        timeData={this.timeData} timeLineData={this.timeLineData}
                        room={this.room} selectedTime={this.state.selectedTime} />
                    {this.TimeLine()}
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

        return(
            <div ref={this.timeLineRef} className="timeline">
                <Button data-direction="left" className="prev"
                    onMouseDown={e => {
                        this.handleScrollMouseDown(e, 'left');
                    }}
                    onMouseUp={e => {
                        this.handleScrollMouseUp(e, 'left');
                    }}>
                    <ArrowLeftIcon/>
                </Button>
                <div className="buttonsWrapper loading">
                    <div className="timeButtons">
                        {this.timeLineData.items.map((item, index) => (
                            <Button {...buttonProps(item, index)}>{item.label}</Button>
                        ))}
                    </div>
                </div>
                <Button data-direction="right" className="next"
                    onMouseDown={e => {
                        this.handleScrollMouseDown(e, 'right');
                    }}
                    onMouseUp={e => {
                        this.handleScrollMouseUp(e, 'right');
                    }}>
                    <ArrowRightIcon/>
                </Button>
            </div>
        );
    }
}

function EventDetails(props) {
    console.log('EventDetails render');
    const room = props.room;
    const selectedTime = props.selectedTime;

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
                        <Button onClick={props.onSubmit} variant="contained" color="secondary"
                        size="medium" fullWidth type="submit" className="addEvent">Add event</Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RoomEvents;
