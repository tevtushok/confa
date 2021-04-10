import api from './api.js';
export const list = async () => {
    try {
        return await api.get('/rooms/list');
    }
    catch (error) {
        return {
            error: true,
            response: error
        };
    }
};
