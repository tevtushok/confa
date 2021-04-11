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
}

export default new EventsApi();
