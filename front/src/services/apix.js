import axios from "axios";
import ApiDataTypeError from './error';
import Response from './response';


const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL
});
axiosInstance.interceptors.response.use(
    response => successHandler(response),
    error => errorHandler(error)
)

function successHandler(res) {
    const response = new Response(res);
    if (!response.hasValidApiResponse()) {
        throw new ApiDataTypeError('Invalid response from server.');
    }
    return {
        error: false,
        response: response,
    };
}

function errorHandler(error) {
    const response = new Response(error.response);
    return {
        error: error,
        response: response,
    }
}
export default class Api {
    constructor() {
        this.axios = axiosInstance;
    }
}