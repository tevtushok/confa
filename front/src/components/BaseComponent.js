import react, { Component } from 'react'; 
export default class BaseComponent extends Component {
	constructor(props) {
		super(props);
		this.alert = this.alert.bind(this);
		this.scrollToMessages = this.scrollToMessages.bind(this);
	}
	scrollToMessages() {
		const className = this.constructor.name;
		const containerId = className + 'Messages';
		const element = document.querySelector('#' + containerId);
		if (element) {
			element.scrollIntoView({behavior: "smooth"});
		}
	}

	alert(obj, scroll = true) {
		this.setState(obj);
		if (scroll) {
			this.scrollToMessages();
		}
	}
}