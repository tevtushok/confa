const path = require('path');
const webpack = require('webpack');
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

const { whenProd } = require('@craco/craco');


const fs = require('fs');

const smp = new SpeedMeasurePlugin({
    outputFormat: "json",
    disable: !process.env.MEASURE,
});

// const handlerProgress = (percentage, message, ...args) => {
//     fs.appendFile('progress.log', [percentage, message, ...args].join('|') + "\n", (err) => { });
// };


module.exports = {
    babel: {
        plugins: [
            ["@babel/plugin-proposal-decorators", { "legacy": true }],
            ...whenProd(() => ["transform-remove-console"]),
        ]
    },
    eslint: {
        enable: false,
    },
    webpack: {
        plugins: {
            add: [
                smp,
                // new webpack.ProgressPlugin(handlerProgress),
            ],
        },
    },
};
