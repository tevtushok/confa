import Api from './apix';

class EventsApi extends Api{
    add(data) {
        return this.axios.post('/events/add', data);
    }

    delete(id) {
        return this.axios.delete('/events/' + id);
    }

    details(id) {
        return this.axios.get('/events/details/' + id);
    }

    list(ymd, rooms = null) {
        let params = { date: ymd, rooms: rooms}
		return this.axios.get('/events/eventList', { params: params })
    }
}

export default new EventsApi();
