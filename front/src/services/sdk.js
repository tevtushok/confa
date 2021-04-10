import ApiDataTypeError from './error';


export default class Sdk {
    constructor(axios) {
        this.axios = axios;
    }

    get(url, params = {}) {
        const config = {
            method: 'get',
            url: url,
            params: params
        };
        return this.request(config);
    }

    post(url, data) {
        const config = {
            method: 'post',
            url: url,
            data: data,
        };
        return this.request(config);
    }

    put(url, data) {
        const config = {
            method: 'put',
            url: url,
            data: data,
        };
        return this.request(config);
    }

    delete(url, data) {
        const config = {
            method: 'delete',
            url: url,
            data: data,
        };
        return this.request(config);
    }

    async request(config) {
        return this.axios(config).then(res => {
            const response = this.onResponse(res);
            if (!response.hasValidApiResponse()) {
                throw new ApiDataTypeError('Invalid response from server.');
            }
            return response;
        });
    }

    onResponse(response) {
        console.info('onResponse');
        return new Response(response);
    }
}

class Response {
    constructor(response) {
        this.init(response);
    }

    init(response) {
        for(let key in response) {
            this[key] = response[key];
        }
        console.log(this);
    }

    getApiCode() {
        console.log('getApiCode', this.getNestedPropertyValue(this, 'data.code'));
        return this.getNestedPropertyValue(this, 'data.code');
    }

    getApiMessage() {
        console.log('getApiMessage', this.getNestedPropertyValue(this, 'data.message'));
        return this.getNestedPropertyValue(this, 'data.message');
    }

    getApiData() {
        console.log('getApiData', this.getNestedPropertyValue(this, 'data.data'));
        return this.getNestedPropertyValue(this, 'data.data');
    }

    hasValidApiResponse() {
        let qq = (this.getApiCode() !== null
            && this.getApiMessage() !== null
            && this.getApiData() !== null) ? true : false;
        console.log('hasValidApiResponse', qq);
        return (this.getApiCode() !== null
            && this.getApiMessage() !== null
            && this.getApiData() !== null) ? true : false;
    }

    getErrorFields() {
        const apiData = this.getApiData();
        return apiData ? apiData['errors'] : null;
    }

    /*
     * @obj Object
     * @path string key path separated by dott
     * @return Boolean
     */
    hasNestedProperty(obj, path) {
        function _hasNestedKey(obj, key, ...rest) {
            if ('undefined' === typeof obj) return false;
            if (!rest.length) return obj.hasOwnProperty(key);
            return _hasNestedKey(obj[key], ...rest);
        }
        const chains = path.split('.');
        return _hasNestedKey(obj, ...chains);
    }

    /*
     * @obj Object
     * @path string key path separated by dott
     * @return mixed (property value | null)
     */
    getNestedPropertyValue(obj, path) {
        function _getNestedPropertyValue(obj, key, ...rest) {
            if ('undefined' === typeof obj) return null;
            if (!rest.length){
                return obj.hasOwnProperty(key) ? obj[key] : null;
            }
            return _getNestedPropertyValue(obj[key], ...rest);
        }
        const chains = path.split('.');
        return _getNestedPropertyValue(obj, ...chains);
    }
}
