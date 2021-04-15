import Api from './api';

class RoomsApi extends Api {

    list() {
        return this.axios.get('/rooms/list');
    }

    getRoomsWithEventsOfDay(dateString) {
        return this.axios.get('/rooms/roomsWithEventsOfDay/' + dateString);
    }
}
export default new RoomsApi();
