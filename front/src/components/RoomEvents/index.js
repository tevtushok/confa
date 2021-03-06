import React from 'react'
import { Redirect } from 'react-router-dom';
import { withTheme } from '@material-ui/core/styles';

import { inject } from 'mobx-react';
import dayjs from 'dayjs';

import { Button, Grid, Paper, Box } from '@material-ui/core';
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
        this.prevClickedButton = undefined;
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
        this.firstVisibleTimeIndex = index;
    }

    initTimeData() {
        this.timeData = [NaN, NaN];
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
        const buttons = this.timeLineRef.current.querySelectorAll('.postData');
        if (buttons) {
            buttons.forEach(button => {
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
        const nextBtn = this.timeLineRef.current.querySelector('.next');
        const prevBtn = this.timeLineRef.current.querySelector('.prev');
        let left = 0;
        let rightPosLimit = timeButtons.offsetWidth - timeButtonsWidth;
        const buttonsCount = this.getVibisleTimeButtonsCount();
        // if last button is visible stick to right
        if (buttonsCount >= this.timeLineData.items.length - this.firstVisibleTimeIndex) {
            left = rightPosLimit;
            this.firstVisibleTimeIndex = this.timeLineData.items.length - buttonsCount;
            nextBtn.setAttribute('disabled', true);
        }
        else if (this.firstVisibleTimeIndex > 0) {
            nextBtn.removeAttribute('disabled');
            let buttons = this.timeLineRef.current.querySelectorAll('.timebtn');
            [].some.call(buttons, (button, btnIndex) => {
                left += button.offsetWidth;
                return this.firstVisibleTimeIndex <= btnIndex + 1;
            });
        }

        else if (this.firstVisibleTimeIndex < 1) {
            prevBtn.setAttribute('disabled', true);
        }

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
        if (direction) {
            this.mouseDownOnScrollInterval = setInterval(() => {
                this.isMouseHoldedOnScroll = true;
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
            timeLine[item.label] = {
                label: item.label,
                date: item.date,
                event: crossedOrPengingEvent,
                status: status,
                className: '',
                disabled: status !== STATUSES.AVAILABLE,
            };
        });
        return timeLine;
    }

    handleTimeClick = (e) => {
        const label = e.currentTarget.dataset.label;
        this.setTimeData(e.currentTarget);
        this.changeTime(label);
        this.prevClickedButton = e.currentTarget;
    };

    setIntermediate = () => {
        this.timeLineRef.current.querySelectorAll('.timebtn').forEach((btn, index) => {
            if (this.timeData[0] && index >= this.timeData[0]
                && this.timeData[1] && index <= this.timeData[1]) {
                btn.classList.add('intermediate');
            }
            else {
                btn.classList.remove('intermediate');
            }
        });
    };

    getTimeData = () => {
        return this.timeData.filter(value => value).sort().map(timeIndex => {
            let label = this.timeLineData.items[timeIndex].label;
            return label;
        });
    }

    setTimeData(clickedBtn) {
        let newTimeData = Array.from(this.timeData);
        let status = clickedBtn.dataset.status
        let index = clickedBtn.dataset.index;
        if (status !== STATUSES.AVAILABLE) {
            return;
        }
        // unselect when maches with first
        if (index === this.timeData[0]) {
            newTimeData[0] = NaN;
            console.log('unselect when maches with first');
        }
        // unselect when maches with second
        else if (index === this.timeData[1]) {
            newTimeData[1] = NaN;
            console.log('// unselect when maches with second');
        }
        // save to first if first is not set
        else if(!(this.timeData[0])) {
            newTimeData[0] = index;
            console.log(' // save to first if first is not set ');
        }
        // save to second if second is not set
        else if (!(this.timeData[1])) {
            newTimeData[1] = index;
            newTimeData = newTimeData.sort();
            console.log(' // save to second if second is not set ');
        }

        else {
            // if index less then first index change first index to new index
            if (index < newTimeData[0]) {
                newTimeData[0] = index;
                console.error('qp');
                console.log(' // if index less then first index change first index to new index ');
            }
            // otherwise change secound index to new index
            // in case when need to change time end its good logic but when need to change "time start" its confuse
            else {
                newTimeData[1] = index;
                console.error('qb');
                console.log(' // otherwise change secound index to new index');
            }
        }
        // both date selected - check intermediate times statuses
        console.log('newTimeData', newTimeData);
        console.log('timeLine', this.timeLine);
        if (newTimeData[0] && newTimeData[1]) {
            const sortedIndexes = Array.from(newTimeData).sort();
            for(let i = sortedIndexes[0]; i <= sortedIndexes[1]; i++) {
                const label = this.timeLineData.items[i].label;
                const status = this.timeLine[label].status;
                if (STATUSES.AVAILABLE !== status) {
                    console.log('found not available', 'label', label, status);
                    return false;
                }
            }
        }

        for(let i = 0; i <= 1; i++) {
            if (!this.timeData[i] && newTimeData[i]) {
                // add new selection
                const btn = this.timeLineRef.current.querySelector(`.timebtn[data-index="${newTimeData[i]}"]`);
                btn.classList.add('postData');
            }
            else if (this.timeData[i] && !newTimeData[i]) {
                // remove old selection
                const btn = this.timeLineRef.current.querySelector(`.timebtn[data-index="${this.timeData[i]}"]`);
                btn.classList.remove('postData');
            }
            else if (this.timeData[i] && newTimeData[i] && this.timeData[i] !== newTimeData[i]) {
                // replace selection with new index
                const prevBtn = this.timeLineRef.current.querySelector(`.timebtn[data-index="${this.timeData[i]}"]`);
                const newBtn = this.timeLineRef.current.querySelector(`.timebtn[data-index="${newTimeData[i]}"]`);
                prevBtn.classList.remove('postData');
                newBtn.classList.add('postData');
            }
        }

        // clickedBtn.classList.add('postData');
        console.log('setIntermediate');
        this.timeData = newTimeData;
        console.log('new', this.timeData);
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
        const timeLabels = this.getTimeData();
        timeLabels.forEach(label => {
            args.push(
                dayjs(`${dayjs(this.date).format('YYYY-MM-DD')} ${label}`).format('YYYY-MM-DDTHH:mm')
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
                <Paper className="baseWrapper">
                    <EventDetails onSubmit={this.handleAddEvent}
                        timeData={this.getTimeData()}
                        room={this.room} selectedTime={this.state.selectedTime} />
                    {this.TimeLine()}
                </Paper>
            </div>
        );
    }


    TimeLine() {
        const buttonProps = (item, index) => {
            const label = item.label;
            const status = this.timeLine[label]['status'];
            const className = `timebtn ${status} ${this.timeLine[label].className}`;
            const theme = this.props.theme;
            const borderColor = theme.palette.status[status];
            return {
                id: `${this.room.number}-scrollable-auto-tab-${index}`,
                'aria-controls': `${this.room.number}-scrollable-auto-tab-${index}`,
                'aria-label': label,
                key: index,
                'data-label': label,
                'data-index': index,
                style: {
                    borderColor: borderColor,
                },
                'data-status': status,
                label: item.label,
                className: className,
                onClick: this.handleTimeClick,
            };
        };

        return(
            <Box ref={this.timeLineRef} className="timeline">
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
            </Box>
        );
    }
}

function EventDetails(props) {
    console.log('EventDetails render');
    const room = props.room;
    const selectedTime = props.selectedTime;
    const timeData = props.timeData;

    const status = selectedTime.status;

    const renderEventInfo = () => {
        switch(status) {
            case STATUSES.PENDING:
            case STATUSES.RESERVED:
                return (
                    <div className="pengindEvent">
                        <div>Start in: {EventHelper.dateFormatClient(selectedTime.event.date_start, 'DD-MM-YYYY HH:mm')}</div>
                        <div>Ends in: {EventHelper.dateFormatClient(selectedTime.event.date_end, 'HH:mm')}</div>
                    </div>
                );
            default:
                return '';
        }
    };

    const renderSelectedTime = () => {
        let container = '';
        if (timeData.length) {
            let times = [];
            times.push(<span key="start">{timeData[0]}</span>);
            if (timeData[1]) {
                times.push(<span key="divider" className="timesDivider"> - </span>);
                times.push(<span key="end">{timeData[1]}</span>);
            }
            container = (
                <span className="times">
                    ( {times} )
                </span>
            );
        }
        return container;
    }

    return(
        <div className="infoWrapper">
            <Box bgcolor={`status.${status}`} className={`statusBar ${status}`}></Box>
            <div className="detailsWrapper">
                <div className="details">
                    <div className="number">Number: {room.number}</div>
                    <div className="title">Title: {room.title}</div>
                    <div className="status">Status: {status}</div>
                </div>
                {renderEventInfo()}
                <Grid container className="addEventWrapper">
                    <Button onClick={props.onSubmit} variant="contained" color="primary"
                        size="medium" fullWidth type="submit" className="addEvent">
                        Add event {renderSelectedTime()}
                    </Button>
                </Grid>
            </div>
        </div>
    );
}

export default withTheme(RoomEvents);
