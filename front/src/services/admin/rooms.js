import api from './adminApi.js';

export const getRooms = async () => {
	try {
		return await api.get('/rooms');
	}
	catch (error) {
		return {
				error: true,
				response: error.response
			};
	}
}

export const saveRooms = async (rooms) => {
	try {
		return await api.post('/rooms', {rooms: rooms});
	}
	catch (error) {
		return {
			error: true,
			response: error.response
		}
	}
}

export const deleteRoom = async (id) => {
	try {
		console.log('axios deleteRoom width id: ' + id)
		return await api.delete(`/rooms/${id}`);
	}
	catch (error) {
		return {
			error: true,
			response: error.response
		}
	}
}

export const validateInputFields = (fields, data = false) => {
    const fieldNames = 'string' === typeof fields ? [fields] : fields;
    if (Array.isArray(fieldNames)) {
        const errors = {};
        fieldNames.forEach(field => {
            if ('title' === field && !validateRoomTitle(data.title)) {
                errors.title = 'Atleast 3 characaters required';
            }
            if ('number' === field && !validateRoomNumber(data.number)) {
                errors.number = 'Invalid number';
            }
        });
        
        return Object.keys(errors).length ? errors : true;
    }
}

function validateRoomTitle(title = false) {
  return 'string' === typeof title && title.length >= 3;
}

function validateRoomNumber(number = false) {
  console.log('number', number)
  return (!isNaN(number) && number !== '');
}