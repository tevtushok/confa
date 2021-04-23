export default class Response {
    constructor(response) {
        this.init(response);
        this.name = 'my own response';
    }

    init(response) {
        for(let key in response) {
            this[key] = response[key];
        }
    }

    getApiCode() {
        return parseInt(this.getNestedPropertyValue(this, 'data.code'));
    }

    getApiMessage() {
        return this.getNestedPropertyValue(this, 'data.message');
    }

    getApiData() {
        return this.getNestedPropertyValue(this, 'data.data');
    }

    hasValidApiResponse() {
        return (Number.isInteger(this.getApiCode())
            && this.getApiMessage() !== null) ? true : false;
    }

    getErrorFields() {
        const apiData = this.getApiData();
        return apiData ? apiData['errors'] : {};
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
