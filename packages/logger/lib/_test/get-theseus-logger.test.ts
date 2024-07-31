import type { Mock } from "vitest";
import {
	expect, describe, beforeEach, it, vi,
} from "vitest";
import * as winston from "winston";
import { getTheseusLogger, type MockLoggingLib } from "../get-theseus-logger.js";
import winstonConfigBuilder from "../winston-config-builder.js";

describe("getLogger", function () 
{
	let mockLoggingLib: Mock<[string], MockLoggingLib>;

	beforeEach(function () 
	{
		// Create a mock logging library object with mocked getLogger method
		mockLoggingLib = vi.fn<[string], MockLoggingLib>().mockReturnValue({
			debug: vi.fn(),
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn(),
			verbose: vi.fn(),
			silly: vi.fn(),
			major: vi.fn(),
			trace: vi.fn(),
			format:
                winstonConfigBuilder().config.format ??
                winston.format(() => 
                {
                	return true;
                })(),
		} as any);
	});

	it("should create a logger with the specified name using the mock logging library", function () 
	{
		const loggerName = "testLogger";
		getTheseusLogger(loggerName, mockLoggingLib);

		// Verify getLogger was called with the correct name on the mock
		expect(mockLoggingLib).toHaveBeenCalledWith(loggerName);
	});

	it("should return a logger instance with expected methods from the mock library", function () 
	{
		const logger = getTheseusLogger("testLogger", mockLoggingLib);

		const keys = ["debug", "info", "warn", "error", "major", "silly", "verbose", "trace"];

		// Verify the returned logger has the expected methods
		keys.forEach((key) => 
		{
			expect(logger).toHaveProperty(key);
		});
		expect(logger).toHaveProperty("format");

		// Optionally, verify that these methods are indeed functions
		keys.forEach((key) => 
		{
			expect(logger[key as keyof typeof logger]).toBeTypeOf("function");
		});
	});
});
