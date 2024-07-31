import {
	afterAll, beforeEach, describe, expect, it, vi,
} from "vitest";
import type * as theseusLoggerModule from "theseus-logger";

const createLogSpy = () => ({
	warn: vi.fn(),
	error: vi.fn(),
	debug: vi.fn(),
});

let logSpy: ReturnType<typeof createLogSpy>;

vi.mock("theseus-logger", async () => 
{
	const actual = await vi.importActual<typeof theseusLoggerModule>("theseus-logger");
	return {
		...actual,
		getTheseusLogger: () => logSpy,
	};
});

describe("fail function", () => 
{
	beforeEach(() => 
	{
		vi.resetModules();
		logSpy = createLogSpy();
	});

	afterAll(() => 
	{
		vi.resetAllMocks();
	});

	it("calls log.debug when strict is undefined or false", async () => 
	{
		const { fail } = await import("../strictness.js");
		const { getTheseusLogger } = await import("theseus-logger");

		fail(undefined, "Test message");
		expect(logSpy.debug).toHaveBeenCalledWith("Test message");

		fail({
			strict: false, 
		}, "Test message");
		expect(logSpy.debug).toHaveBeenCalledTimes(2);
	});

	it("calls log.warn when strict is 'warn'", async () => 
	{
		const { fail } = await import("../strictness.js");
		const { getTheseusLogger } = await import("theseus-logger");

		fail(
			{
				strict: "warn",
			},
			"Warning message",
		);
		expect(logSpy.warn).toHaveBeenCalledWith("Warning message");
	});

	it("throws an error and calls log.error when strict is true and multiple parameters are provided", async () => 
	{
		const { fail } = await import("../strictness.js");
		const { getTheseusLogger } = await import("theseus-logger");

		expect(() =>
			fail(
				{
					strict: true,
				},
				"Error message",
				"Extra info",
			),
		).toThrow("Error message");
		expect(logSpy.error).toHaveBeenCalledWith("Error message", "Extra info");
	});

	it("throws an error with the correct message when strict is true and only one parameter is provided", async () => 
	{
		const { fail } = await import("../strictness.js");
		const { getTheseusLogger } = await import("theseus-logger");

		expect(() =>
			fail(
				{
					strict: true,
				},
				"Error message",
			),
		).toThrow("Error message");
	});
});
