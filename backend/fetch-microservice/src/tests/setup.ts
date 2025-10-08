// Jest setup file for fetch-microservice tests
import "reflect-metadata";

// Global test timeout
jest.setTimeout(60_000);

// Mock console to reduce noise in tests unless debugging
if (process.env.DEBUG_TESTS !== "true") {
  globalThis.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  };
}
