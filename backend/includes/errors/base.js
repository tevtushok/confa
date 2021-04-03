module.exports = class BaseError extends Error {
   constructor(code, message, data = null) {
       super(message);
       this.code = code;
       this.data = data;
   }
}
