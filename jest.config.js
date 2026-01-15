/* eslint-disable no-undef */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  colletCoverage: true,
  coverageProvider: "v8",
  collectCoverageFrom: ["src/**/*.ts", "!tests/**", "!**/node_modules/**"],
  roots: ["<rootDir>/src"],
  moduleFileExtensions: ["ts", "js"],
  clearMocks: true,
  transform: {
    "^.+\\.ts$": "ts-jest",
    "^.+\\.js$": "babel-jest",
  },
  transformIgnorePatterns: ["/node_modules/(?!(mock-jwks|until-async|msw)/)"],
};
