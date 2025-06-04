const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/src/migrations/",
    "/src/config/",
    "/src/types/",
    "plugins/oauth/",
    "plugins/auth.plugin.ts",
    "plugins/dotenvPlugin.ts",
    "plugins/jwtPlugin.ts",
    "handlers/callback.handler.ts",
    "utils/",
  ],
};