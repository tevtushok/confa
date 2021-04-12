const fs = require('fs');
const getActualRequestDurationInMilliseconds = start => {
    const NS_PER_SEC = 1e9; //  convert to nanoseconds
    const NS_TO_MS = 1e6; // convert to milliseconds
    const diff = process.hrtime(start);
    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};


module.exports = logger =  (req, res, next) => { //middleware function
    const current_datetime = new Date();
    const formatted_date =
        current_datetime.getFullYear() +
        "-" +
        (current_datetime.getMonth() + 1) +
        "-" +
        current_datetime.getDate() +
        " " +
        current_datetime.getHours() +
        ":" +
        current_datetime.getMinutes() +
        ":" +
        current_datetime.getSeconds();
    const method = req.method;
    const url = req.url;
    const status = res.statusCode;
    const start = process.hrtime();
    const durationInMilliseconds = getActualRequestDurationInMilliseconds(start);
    const body = 'BODY:' + JSON.stringify(req.body);
    const log = `[${formatted_date}] ${method}:${url} ${status} ${body} ${durationInMilliseconds.toLocaleString()} ms`;
    console.log(log);
    fs.appendFile('./logs/request_logs.log', log + "\n", err => {
        if (err) {
            console.log(err);
        }
    });
    next();
};
