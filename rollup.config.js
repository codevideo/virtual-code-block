import typescript from 'rollup-plugin-typescript2';
import dts from 'rollup-plugin-dts';

export default  [
  // standard package
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "es",
    },
    plugins: [typescript()],
    external: ["@fullstackcraftllc/codevideo-types"]
  },
  // type declarations
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.d.ts", 
        format: "es",
      },
    ],
    plugins: [
      dts(),
    ],
    external: ["@fullstackcraftllc/codevideo-types"]
  },
];

