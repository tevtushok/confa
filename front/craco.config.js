const path = require('path');
const webpack = require('webpack');
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

const { whenProd } = require('@craco/craco');


const fs = require('fs');

const smp = new SpeedMeasurePlugin({
    outputFormat: "humanVerbose",
    disable: !process.env.MEASURE,
});

// const handlerProgress = (percentage, message, ...args) => {
//     fs.appendFile('progress.log', [percentage, message, ...args].join('|') + "\n", (err) => { });
// };


module.exports = {
    babel: {
        plugins: [
            ["@babel/plugin-proposal-decorators", { "legacy": true }],
            [
                'babel-plugin-transform-imports',
                {
                    '@material-ui/core': {
                        // Use "transform: '@material-ui/core/${member}'," if your bundler does not support ES modules
                        'transform': '@material-ui/core/esm/${member}',
                        'preventFullImport': true
                    },
                    '@material-ui/icons': {
                        // Use "transform: '@material-ui/icons/${member}'," if your bundler does not support ES modules
                        'transform': '@material-ui/icons/esm/${member}',
                        'preventFullImport': true
                    }
                }
            ],
            ...whenProd(() => ["transform-remove-console"], []),
        ],
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
