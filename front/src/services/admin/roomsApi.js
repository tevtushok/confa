import Api from './adminApi.js';

class RoomsApi extends Api {
    getRoomsList() {
        return this.axios.get('/rooms/roomsList');
    }
    saveRooms = (rooms) => {
        return this.axios.post('/rooms/saveRooms', {rooms: rooms});
    }
    deleteRoom = (id) => {
        return this.axios.delete(`/rooms/room/${id}`);
    }
}

export default new RoomsApi();
