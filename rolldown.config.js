import { defineConfig } from "rolldown";
import { resolve } from "path";

export default defineConfig({
  input: "src/index.js",
  resolve: {
    alias: {
      "src": resolve("./src"),
    },
  },
  output: {
    file: "content.js",
    format: "iife",
    minify: false,
  },
});
