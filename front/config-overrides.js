const {
    override,
    disableEsLint,
    addDecoratorsLegacy,
} = require("customize-cra");

// module.exports = override(addDecoratorsLegacy());

module.exports = {
    webpack: override(
        // usual webpack plugin
        addDecoratorsLegacy(),
        disableEsLint(),
        (config) => {
            config.cache = { type: 'memory'};
            return config;
        },
    ),
};
