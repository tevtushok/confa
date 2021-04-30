import createAxiosInstance from '../axios';


const axiosInstance = createAxiosInstance(process.env.REACT_APP_ADMIN_API_BASE_URL);

class AdminApi {
    constructor() {
        this.axios = axiosInstance;
    }
}

export default AdminApi;
