import React from 'react';

export const RENDER_STATES = {
    INIT: 'INIT',
    FAILURE: 'FAILURE',
    COMMON: 'COMMON',
};

export const COMPONENT_STATE = {
    renderState: RENDER_STATES.INIT,
    serviceMessage: null,
    errors: null,
    isLoading: false,
};

export default class BaseComponent extends React.Component {
	constructor(props) {
		super(props);
        this.state = COMPONENT_STATE;
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

    setPermissionError(message, opts = {}) {
        const defaults = {
            serviceMessage: message,
            renderState: RENDER_STATES.FAILURE,
        };
        const state = Object.assign(defaults, opts);
        this.setState(state);
    }

    setValidationError(message, errors = {}, opts = {}) {
        const defaults = {
            serviceMessage: message,
            errors: errors,
        };
        const state = Object.assign(defaults, opts);
        this.setState(state);
    }

	alert = (obj, scroll = true) => {
		this.setState(obj);
		if (scroll) {
			this.scrollToMessages();
		}
	};
}
