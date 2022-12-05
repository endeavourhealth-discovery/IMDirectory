import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import dts from "rollup-plugin-dts";

export default [
  {
    input: "src/index.ts",
    output: {
      file: "build/im-library.js",
      format: "cjs",
      sourcemap: true
    },
    plugins: [typescript(), commonjs()],
    external: ["d3", "uuid-random", "lodash"]
  },
  {
    input: "src/index.ts",
    output: {
      file: "build/im-library.d.ts",
      format: "es"
    },
    plugins: [dts()]
  }
];
