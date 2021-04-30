import { makeObservable, observable, action } from 'mobx';
import roomsApi from '../../services/admin/roomsApi';
import { validateRoomNumber, validateRoomTitle }  from '../../includes/validators';

export const RENDER_STATES = {
    INIT: 'INIT',
    COMMON: 'COMMON',
    FAILURE: 'FAILURE',
};

class RoomsStore {
    constructor() {
        makeObservable(this);
    }
    fields = {
        number: {
            required: true, text: 'Number',
        },
        title: {
            required: true, text: 'Title'
        },
        status: { text: 'Status' }
    }

    focusedField = undefined;

    getNewRoomObject() {
        return {
            _id: 'freshRoom_' + this.rooms.length,
            number: '',
            title: '',
            status: 'closed',
            // isNew nean room not yet stored in database
            isNew: true
        }
    }

    getRequiredFields() {
        return Object.keys(this.fields).filter(field => true === this.fields[field].required);
    }

    @observable renderState = RENDER_STATES.INIT;
    @observable rooms = [];
    @observable page = 1;
    @observable errorMessage = '';
    @observable isLoading = false;

    @action setErrorMessage(msg) {
        this.errorMessage = msg;
    }

    @action loadRoomList() {
        this.isLoading = true;
        roomsApi.getRoomsList()
        .then(action(({ response }) => {
            const apiData = response.getApiData();
            this.renderState = RENDER_STATES.COMMON;
            this.rooms = apiData.rooms;
        }))
        .catch(action(( {error, response }) => {
            this.rooms = [];
            this.renderState = RENDER_STATES.FAILURE;
        }))
        .finally(action(() => {
            this.isLoading = false;
        }));
    }

    @action toggleRoomsStatus(roomId) {
        this.isLoading = true;
        let room = this.rooms.find(room => room._id === roomId);
        if (!room) {
            console.error(`Room with id:${roomId} doesn't exist`);
            return;
        }
        const status = room.status === 'closed' ? 'active' : 'closed';
        room['status'] = status;
        if (room.isNew) {
            try {
                this.createNewRoom(room, {status: status});
            }
            catch (err) {
                console.error('toggleStatusHandler->createNewRoom', err);
                this.setErrorMessage(err.message);
            }

        }
        else {
            try{
                this.updateRoom(room, {status: status});
            }
            catch (err) {
                this.setErrorMessage(err.message)
                console.error('toggleStatusHandler->updateRoom', err)
            }
        }
    }

    @action addFreshRoom() {
        this.rooms.push(this.getNewRoomObject());
    }

    saveFocus(e) {
        console.warn('saveFocus', e);
        this.focusedField = e;
    }

    @action setRoomField(roomId, fieldName, fieldValue) {
        const room = this.rooms.find(room => room._id === roomId);
        if (room) {
            room[fieldName] = fieldValue;
            const validationRes = validateInputFields(fieldName, fieldValue);
            if (true !== validationRes) {
                if (false === 'errors' in room){
                    console.warn('create error prop');
                    room.errors = {};
                }
                console.warn('set err prop', fieldName);

                room.errors[fieldName] = validationRes[fieldName];
                return false;
            }
            else {
                if (room.errors && room.errors[fieldName]) {
                    console.warn('delete err', fieldName);
                    delete room.errors[fieldName];
                }
            }
        }
        return true;
    }

    @action updateField(roomId, name, value) {
        const data = {[name]: value};
        const room = this.rooms.find(room => room._id === roomId);
        room[name] = value;
        if (!room) {
            console.info('updateRoomHandler nothing to save');
            return;
        }

        if (room.isNew) {
            this.createNewRoom(room);
        }
        else {
            this.updateRoom(room, data);
        }
    }

    @action createNewRoom(room) {
        if (!room.isNew) {
            throw new Error('This room in database')
        }
        const requiredFields = this.getRequiredFields();
        this.errors = {}
        const validationRes = validateInputFields(requiredFields, room);
        if (true !== validationRes) {
            console.warn('set all errors props');
            room.errors = validationRes;
            return;
        }
        const postData = {};
        requiredFields.forEach(field => {
            postData[field] = room[field];
        });
        this.isLoading = true;
        roomsApi.saveRooms(postData)
            .then(action(({ response }) => {
                const apiData = response.getApiData();
                const newId = apiData?.room._id;
                // change rooms coming from createNewRoom arg
                if (newId) {
                    room._id = newId;
                    delete room.isNew;
                    // delete room.errors;
                }
                else {
                    this.setErrorMessage('Missed room id from server response');
                }
            }))
            .catch(action(({ error, response }) => {
                const apiData = response && response.getApiData();
                if (apiData.fields && 'object' === typeof apiData.fields) {
                    console.warn('set all err props from resp');
                    room.errors = apiData.fields;
                }
                else {
                    console.error(error);
                    this.setErrorMessage('Server error');
                }
            }))
            .finally(action(() => {
                this.isLoading = false;
            }));
    }

    @action updateRoom(room, data = false) {
        if (room.isNew) {
            throw new Error('This room does not exists in database');
        }
        if ('object' !== typeof data) {
            console.log(data);
            throw new Error('Invalid input data');
        }
        const postData = {_id: room._id};
        const postKeys = Object.keys(data);
        postKeys.forEach(field => {
            if (field in room) {
                postData[field] = data[field];
                room[field] = data[field]
            }
        });
        const validationRes = validateInputFields(Object.keys(postData), postData);
        console.warn('validationRes', validationRes);
        if (true !== validationRes) {
            if (false === 'errors' in room.errors) {
                room.errors = {};
            }
            Object.keys(validationRes).forEach(key => {
                room.errors[key] = validationRes[key];
            });
        }
        if (room.errors && Object.keys(room.errors).length > 0) {
            return false;
        }
        this.isLoading = true;
        roomsApi.saveRooms(postData)
        .then(action(({ response }) => {
            // restore focus after disable inputs
            setTimeout(() => {
                this.focusedField.focus();
            }, 0);
        }))
        .catch(action(({ error, response }) => {
            if (response) {
                if (response.getApiCode() === 1105) {
                    console.error('This room does not exists on database');
                    this.setErrorMessage('This room does not exists on database');
                    setTimeout(() => {
                        this.loadRooms();
                    }, 2000);
                    return;
                }
                const apiData = response.getApiData();
                const errorFields = (apiData.fields && 'object' === typeof apiData.fields) || null;
                if (errorFields) {
                    room.errors = apiData.fields;
                }
            }

        }))
        .finally(action(() => {
            this.isLoading = false;
        }));
    }

    @action deleteRoom(roomId) {
        let needleRoom = false;
        let roomsFiltered = this.rooms.filter(room => {
            if (room._id === roomId) {
                needleRoom = room;
                return false;
            }
            return true;
        });

        if (!needleRoom) {
            console.error('Nothing to delete');
            return;
        }

        else {
            this.isLoading = false;
            roomsApi.deleteRoom(roomId)
            .then(action(({ response }) => {
                this.rooms = roomsFiltered;
            }))
            .catch(action(({ error, response }) => {
                const message = (error && error.getApiMessage()) || 'Error while deleting';
                if (response && 1104 === response.getApiCode()) {
                    this.rooms = roomsFiltered;
                }
                else {
                    this.setErrorMessage(message)
                }
            }))
            .finally(action(() => {
                this.isLoading = false;
            }));
        }
    }


}

export const validateInputFields = (fields, data  = []) => {
    const fieldNames = 'string' === typeof fields ? [fields] : fields;
    if (Array.isArray(fieldNames)) {
        const errors = {};
        fieldNames.forEach(field => {
            let validateFunc;
            switch(field) {
                case 'title':
                    validateFunc = validateRoomTitle;
                    break;
                case 'number':
                    validateFunc = validateRoomNumber;
                    break;
                default: validateFunc = undefined;
            }
            if (validateFunc) {
                const value = fieldNames.length === 1 ? String(data) : data[field];
                const isValid = validateFunc(value);
                if (true !== isValid)
                    errors[field] = isValid;
            }
        });

        return Object.keys(errors).length ? errors : true;
    }
}

export default new RoomsStore();
