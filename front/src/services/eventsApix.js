import Api from './apix';

class EventsApi extends Api{
    add(data) {
        return this.axios.post('/events/add', data);
    }
}

export default new EventsApi();
