import axios from './axios';
import Api from './sdk';
import CODES from './codes';


class EventsApi extends Api {
    add(data) {
        return this.post('/events/add', data);
    }
    isValidationError() {
        const code = this.getApiCode();
        return code == CODES.EVENTS.VALIDATION;
    }
}

export default new EventsApi(axios);
