import React from 'react';
import { BASE_RENDER_STATES as RENDER_STATES } from '../includes/constants';

export default class BaseComponent extends React.Component {
	constructor(props) {
		super(props);
        this.state = {
            renderState: RENDER_STATES.INIT,
        }
	}
	scrollToMessages() {
		const className = this.constructor.name;
		const containerId = className + 'Messages';
		const element = document.querySelector('#' + containerId);
		if (element) {
			element.scrollIntoView({behavior: "smooth"});
		}
	}

    setServerError = (message, opts = {}) => {
        const defaults = {
            serviceMessage: message,
            renderState: RENDER_STATES.FAILURE,
        };
        const state = Object.assign(defaults, opts);
        this.setState(state);
    };

	alert = (obj, scroll = true) => {
		this.setState(obj);
		if (scroll) {
			this.scrollToMessages();
		}
	};
}
