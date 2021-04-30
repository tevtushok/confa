import createAxiosInstance from './axios';


const axiosInstance = createAxiosInstance(process.env.REACT_APP_API_BASE_URL);

class Api {
    constructor() {
        this.axios = axiosInstance;
    }
}

export default Api;
