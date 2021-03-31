module.exports = class BaseError extends Error {
   constructor(code, message) {
       super(message);
       this.code = code;
   }
}
