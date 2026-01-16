module.exports = {
  preset: "ts-jest",

  testEnvironment: "node",
  collectCoverage: true,
  coverageProvider: "v8",

  collectCoverageFrom: ["src/**/*.ts", "!tests/**", "!**/node_modules/**"],

  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/src/migrations/",
    "/src/types/",
    "/src/index.ts",
  ],

  roots: ["<rootDir>/src"],
  moduleFileExtensions: ["ts", "js"],
  clearMocks: true,

  transform: {
    "^.+\\.ts$": "ts-jest",
    "^.+\\.js$": "babel-jest",
  },

  transformIgnorePatterns: ["/node_modules/(?!(mock-jwks|until-async|msw)/)"],

  // 🔥 THIS IS THE IMPORTANT PART
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 40,
      lines: 40,
      statements: 40,
    },
  },
};
