import React from 'react';
import TextField from '@material-ui/core/TextField';
import { FormControl, InputLabel, Select } from '@material-ui/core'
import DateFnsUtils from '@date-io/date-fns'; // choose your lib
import {
    DatePicker,
    TimePicker,
    DateTimePicker,
    MuiPickersUtilsProvider,
} from '@material-ui/pickers';

class NewEvent extends React.Component {
    constructor(props) {
        super(props)
        const search = this.props.location.search;
        const date = new URLSearchParams(search).get('date')
        const interval = new URLSearchParams(search).get('interval');
        const room = new URLSearchParams(search).get('room');
        this.state = {
            interval: interval || null,
            room: room || null,
            date: new Date()
        }
        this.handleDateChange = this.handleDateChange.bind(this)
    }

    handleDateChange() {
    }

    render() {
        let date = new Date()
        let time = null
        return (
            <div className="newEvent page">
                <h2 className="text-center">New Event</h2>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <DatePicker value={date} onChange={this.handleDateChange} />
                    <TimePicker value={time} onChange={this.handleDateChange} />
                </MuiPickersUtilsProvider>
            </div>
        )
    }
}

export default NewEvent
