const { ProvidePlugin } = require("webpack");

module.exports = function (config, env) {
  return {
    ...config,
    // node: { fs: 'empty' },
    // devtool: config.devtool,
    // target: 'web', // Make web variables accessible to webpack, e.g. window
    module: {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /\.(m?js|ts)$/,
          enforce: "pre",
          use: ["source-map-loader"],
          resolve: {
            // a fix for an issue with process/browser
            fullySpecified: false
          }
        },
      ],
    },
    plugins: [
      ...config.plugins,
      new ProvidePlugin({
        process: "process/browser",
        Buffer: ['buffer', 'Buffer']
      }),
    ],
    resolve: {
      ...config.resolve,
      fallback: {
        assert: require.resolve("assert"),
        buffer: require.resolve("buffer"),
        child_process: false,
        constants: require.resolve("constants-browserify"),
        crypto: require.resolve("crypto-browserify"),
        fs: false,
        os: require.resolve("os-browserify/browser"),
        path: require.resolve("path-browserify"),
        perf_hooks: false,
        stream: require.resolve("stream-browserify"),
        url: false
      },
    },
    ignoreWarnings: [/Failed to parse source map/],
  };
};
