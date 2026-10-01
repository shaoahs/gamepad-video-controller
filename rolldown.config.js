import { defineConfig } from "rolldown";

export default defineConfig({
  input: "src/index.js",
  output: {
    file: "content.js",
    format: "iife",
    minify: false, // 開發時保持可讀，發布時改 true
  },
});
