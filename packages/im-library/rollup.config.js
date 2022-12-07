import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import dts from "rollup-plugin-dts";

export default [
  {
    input: "src/index.ts",
    output: {
      dir: "dist",
      preserveModules: true,
      format: "es",
      sourcemap: true,
      exports: "named"
    },
    plugins: [typescript(), commonjs()],
    external: ["d3", "uuid-random", "lodash"]
  },
  {
    input: "src/index.ts",
    output: {
      file: "dist/im-library.js",
      format: "es",
      sourcemap: true
    },
    plugins: [typescript(), commonjs()],
    external: ["d3", "uuid-random", "lodash"]
  },
  {
    input: "src/index.ts",
    output: {
      file: "dist/im-library.d.ts",
      format: "es"
    },
    plugins: [dts()]
  }
];
