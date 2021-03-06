import axios from "axios";
import ApiDataTypeError from './error';
import Response from './response';
import appStore from '../stores/appStore';

const createAxiosInstance = (baseUrl) => {
    const axiosInstance = axios.create({
        baseURL: baseUrl,
    });
    axiosInstance.interceptors.request.use(function (config) {
        const token = appStore.token;
        config.headers = { Authorization: `Bearer ${token}` }
        return config;
    });

    axiosInstance.interceptors.response.use(
        response => successHandler(response),
        error => errorHandler(error)
    );
    return axiosInstance;
}

export default createAxiosInstance;

function successHandler(res) {
    const response = new Response(res);
    if (!response.hasValidApiResponse()) {
        const error = ApiDataTypeError('Invalid response from server');
        return Promise.reject({ error: error, response: response, });
    }
    return Promise.resolve({ error: false, response: response });
}

function errorHandler(error) {
    const response = new Response(error.response);
    return Promise.reject( { error: error, response: response, });
}
