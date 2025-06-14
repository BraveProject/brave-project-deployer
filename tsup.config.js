import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/**/*", "!src/test/**/*", "!src/**/*.spec.*"],
  outDir: "./build",
  keepNames: true,
  format: "cjs",
  // templates
  loader: { ".vort": "copy" },
  cjsInterop: true,
  minify: true,
  dts: true,
  clean: true,
});