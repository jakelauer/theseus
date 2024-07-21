import { expect } from "chai";
import {
	describe, it, afterEach, 
} from "mocha";
import sinon from "sinon";
import quibble from "quibble";

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type LoggerMock = typeof import("theseus-logger");

const logSpy = {
	warn: sinon.spy(),
	error: sinon.spy(),
	debug: sinon.spy(),
};

await quibble.esm<LoggerMock>("theseus-logger", {
	getTheseusLogger: (name: string) => 
	{
		console.log("Mock getTheseusLogger called with name:", name);
		return logSpy as any;
	},
});

const { fail } = await import("../strictness.js");

describe("fail function", () => 
{
	afterEach(() => 
	{
		sinon.restore();
		logSpy.warn.resetHistory();
		logSpy.error.resetHistory();
		logSpy.debug.resetHistory();
	});

	it("calls log.debug when strict is undefined or false", () => 
	{
		fail(undefined, "Test message");
		expect(logSpy.debug.calledOnceWith("Test message")).to.be.true;

		fail({
			strict: false, 
		}, "Test message");
		expect(logSpy.debug).to.be.calledTwice;
	});

	it("calls log.warn when strict is 'warn'", () => 
	{
		fail({
			strict: "warn", 
		}, "Warning message");
		expect(logSpy.warn.calledOnceWith("Warning message")).to.be.true;
	});

	it("throws an error and calls log.error when strict is true and multiple parameters are provided", () => 
	{
		expect(() => fail({
			strict: true, 
		}, "Error message", "Extra info")).to.throw("Error message");
		expect(logSpy.error.calledOnceWith("Error message", "Extra info")).to.be.true;
	});

	it("throws an error with the correct message when strict is true and only one parameter is provided", () => 
	{
		expect(() => fail({
			strict: true, 
		}, "Error message")).to.throw("Error message");
	});
});
