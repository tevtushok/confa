import Api from './api';

class EventsApi extends Api{
    addEvent(data) {
        return this.axios.post('/events/event/', data);
    }

    changeEvent(id, data) {
        return this.axios.put('/events/event/' + id, data);
    }

    deleteEvent(id) {
        return this.axios.delete('/events/event/' + id);
    }

    getEvent(id) {
        return this.axios.get('/events/event/' + id);
    }

    list(ymd, rooms = null) {
        let params = { date: ymd, rooms: rooms}
		return this.axios.get('/events/list', { params: params })
    }

    getMyEvents() {
		return this.axios.get('/events/myEvents');
    }
}

export default new EventsApi();
