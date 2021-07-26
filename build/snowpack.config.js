// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    /* ... */
  },
  plugins: [["@snowpack/plugin-babel", {
    "input": ['.js', '.mjs', '.jsx', '.ts', '.tsx'],
    // (optional) specify files for Babel to transform
    transformOptions: {// babel transform options
    }
  }]],
  packageOptions: {
    /* ... */
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    /* ... */
  }
};