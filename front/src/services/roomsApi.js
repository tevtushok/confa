import Api from './api';

class RoomsApi extends Api {
    list() {
        return this.axios.get('/rooms/list');
    }
}
export default new RoomsApi();
