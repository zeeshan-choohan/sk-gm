import { terser } from "rollup-plugin-terser";

export default {
  input: 'main.js',
  output: {
    file: 'bundle.js',
    format: 'iife',
    name: 'myBundle',
    globals: {
      'matter-js': 'Matter' // Set this to the global variable for matter-js
    }
  },
  external: ['matter-js'],
  plugins: [terser()]
};
