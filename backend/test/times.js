module.exports.minutes = (n) => {return 1000 * 60 * n}
module.exports.hours = (n) => {return this.minutes(60) * n}
module.exports.days = (n) => {return this.hours(24) * n}
module.exports.years = (n) => {return this.days(365) * n};
