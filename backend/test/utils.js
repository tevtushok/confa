module.exports.times = {
    minutes: (n) => {return 1000 * 60 * n},
    hours: (n) => {return this.minutes(60) * n},
    days: (n) => {return this.hours(24) * n},
    years: (n) => {return this.days(365) * n},
};

module.exports.parseCookie = str => {
    return str.split(';').map(v => v.split('=')).reduce((acc, v) => {
        const key = decodeURIComponent(v[0]).trim();
        const value = v[1] ? decodeURIComponent(v[1]).trim() : null;
        acc[key] = value;
        return acc;
    }, {});
};
