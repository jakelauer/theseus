import { expect } from "chai";
import {
	beforeEach, describe, it, 
} from "mocha";
import sinon from "sinon";
import * as loggerModule from "theseus-logger";
import proxyquire from "proxyquire";
import type * as StrictnessType from "../strictness.js";

const strictness = proxyquire<typeof StrictnessType>("../strictness", {
	"theseus-logger": {
		getTheseusLogger: () => {},
	},
});

describe("fail function", () => 
{
	let logSpy: { warn: sinon.SinonSpy; error: sinon.SinonSpy; debug: sinon.SinonSpy };
	let fail: any;

	beforeEach(() => 
	{
		logSpy = {
			warn: sinon.spy(),
			error: sinon.spy(),
			debug: sinon.spy(),
		};

		// Use proxyquire to mock 'theseus-logger' module
		fail = strictness.fail;

		sinon.stub(loggerModule, "getTheseusLogger").returns(logSpy as any);
	});

	afterEach(function () 
	{
		sinon.restore();
	});

	it("calls log.debug when strict is undefined or false", () => 
	{
		fail(undefined, "Test message");
		expect(logSpy.debug.calledOnceWith("Test message")).to.be.true;

		fail(
			{
				strict: false,
			},
			"Test message",
		);
		expect(logSpy.debug.calledTwice).to.be.true;
	});

	it("calls log.warn when strict is 'warn'", () => 
	{
		fail(
			{
				strict: "warn",
			},
			"Warning message",
		);
		expect(logSpy.warn.calledOnceWith("Warning message")).to.be.true;
	});

	it("throws an error and calls log.error when strict is true and multiple parameters are provided", () => 
	{
		expect(() =>
			fail(
				{
					strict: true,
				},
				"Error message",
				"Extra info",
			),
		).to.throw("Extra info");
		expect(logSpy.error.calledOnceWith("Error message", "Extra info")).to.be.true;
	});

	it("throws an error with the correct message when strict is true and only one parameter is provided", () => 
	{
		expect(() =>
			fail(
				{
					strict: true,
				},
				"Error message",
			),
		).to.throw("Error message");
	});
});
