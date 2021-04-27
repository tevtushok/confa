const path = require('path');
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

const smp = new SpeedMeasurePlugin({
    outputFormat: "humanVerbose",
});

module.exports = {
    babel: {
        plugins: [
            ["@babel/plugin-proposal-decorators", { "legacy": true }],
        ]
    },
    eslint: {
        enable: false,
    },
    webpack: {
        plugins: {
            add: [smp],
        },
    },
};
