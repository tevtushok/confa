import React from 'react'

export default class ScheduleRoom extends React.Component {
	constructor(props) {
		super(props)
		this.room = this.props.room;
	}
	render() {
		return (
			<div class="scheduleRoom available">
                <div class="scheduleRoom__wrapper">
                    <div class="scheduleRoom__info-wrapper">
                        <div class="scheduleRoom__status-bar"></div>
                        <div class="scheduleRoom__info-details-wrapper">
                            <div class="scheduleRoom__info-details">
                                <strong class="scheduleRoom__title">Main conference room</strong>
                                <div class="scheduleRoom__status-txt">Available</div>
                            </div>
                            <div class="scheduleRoom__buttons-wrapper">
                                <button type="button" class="scheduleRoom__reserve btn btn-dark">Reserve</button>
                            </div>
                        </div>
                    </div>
                    <div class="scheduleRoom__timeblocks btn-group" role="group">
                        <button type="button" class="btn btn-dark scheduleRoom__timeblock available" disabled>10:30</button>
                        <button type="button" class="btn btn-dark scheduleRoom__timeblock available">11AM</button>
                        <button type="button" class="btn btn-dark scheduleRoom__timeblock available">11:30</button>
                        <button type="button" class="btn btn-dark scheduleRoom__timeblock available">12PM</button>
                        <button type="button" class="btn btn-dark scheduleRoom__timeblock available">12:30</button>
                        <button type="button" class="btn btn-dark scheduleRoom__timeblock available">13PM</button>
                        <button type="button" class="btn btn-dark scheduleRoom__timeblock available">13:30</button>
                        <button type="button" class="btn btn-dark scheduleRoom__timeblock next"><img src="../images/icons/next.svg"/></button>
                    </div>
                </div>
            </div>
		);
	}
}