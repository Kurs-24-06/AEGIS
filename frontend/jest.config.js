// frontend/jest.config.js
module.exports = {
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"],
  globalSetup: "jest-preset-angular/global-setup",
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/dist/",
    "<rootDir>/e2e/",
  ],
  coverageDirectory: "<rootDir>/coverage/frontend",
  coverageReporters: ["json", "lcov", "text", "clover", "html"],
  moduleNameMapper: {
    "^@app/(.*)$": "<rootDir>/src/app/$1",
    "^@core/(.*)$": "<rootDir>/src/app/core/$1",
    "^@shared/(.*)$": "<rootDir>/src/app/shared/$1",
    "^@env/(.*)$": "<rootDir>/src/environments/$1",
  },
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "./coverage/frontend",
        outputName: "junit.xml",
      },
    ],
  ],
  testMatch: ["**/*.spec.ts"],
  verbose: true,
  collectCoverageFrom: [
    "src/app/**/*.ts",
    "!src/app/**/*.module.ts",
    "!src/app/**/*.spec.ts",
    "!src/app/testing/**",
    "!**/node_modules/**",
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
  },
  testEnvironment: "jsdom",
};
