import axios from './axios';
import Api from './sdk';


class RoomsApi extends Api {
    list() {
        return this.get('/rooms/list');
    }
}

export default new RoomsApi(axios);
