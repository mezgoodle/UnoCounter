// jest.config.js
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",

  moduleNameMapper: {
    "^@/components/(.*)$": "<rootDir>/components/$1",
    "^@/pages/(.*)$": "<rootDir>/pages/$1",
  },

  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/e2e/",
  ],

  // Coverage configuration
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "!app/**/*.d.ts",
    "!app/**/_*.{js,jsx,ts,tsx}", // Exclude Next.js special files
    "!app/**/layout.tsx",
    "!app/**/loading.tsx",
    "!app/**/error.tsx",
    "!app/**/not-found.tsx",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  coverageReporters: ["text", "lcov", "html"],
};

module.exports = createJestConfig(customJestConfig);
