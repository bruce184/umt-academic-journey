// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import json from "@eslint/json";
import css from "@eslint/css";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  // ----- JavaScript -----
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: {
        // Môi trường browser + node
        ...globals.browser,
        ...globals.node,

        // Các global do mình tự dùng trong FE/BE
        LogAPI: "readonly",
        CourseAPI: "readonly",
        FeeAPI: "readonly",
        BackupAPI: "readonly",
        UserAPI: "readonly",
        Chart: "readonly",
        rolePermissions: "readonly",
        allAuditLogs: "readonly",

        // jQuery global
        $: "readonly",
        jQuery: "readonly",
      },
    },
  },

  // ----- JSON -----
  {
    files: ["**/*.json"],
    plugins: { json },
    language: "json/json",
    extends: ["json/recommended"],
  },

  // ----- CSS -----
  {
    files: ["**/*.css"],
    plugins: { css },
    language: "css/css",
    extends: ["css/recommended"],
  },

  // ----- Ignore chung -----
  globalIgnores(
    ["build/**/*", "package-lock.json", "node_modules/**"],
    "Ignore build directory, lockfile & node_modules"
  ),
]);
