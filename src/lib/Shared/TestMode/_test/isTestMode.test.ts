import { expect } from "chai";

import { isTestMode } from "@Shared/TestMode/isTestMode"; // Adjust the import path as necessary

describe("isTestMode", function () 
{
	let originalArgv: string[];

	beforeEach(function () 
	{
		// Save the original process.argv
		originalArgv = [...process.argv];
	});

	afterEach(function () 
	{
		// Restore the original process.argv after each test
		process.argv = originalArgv;
	});

	it("should return true when --debug-mode flag is present", function () 
	{
		process.argv.push("--debug-mode");
		expect(isTestMode()).to.be.true;
	});

	it("should return false when --debug-mode flag is not present", function () 
	{
		// Ensure --debug-mode is not in process.argv
		const debugIndex = process.argv.indexOf("--debug-mode");
		if (debugIndex !== -1) 
		{
			process.argv.splice(debugIndex, 1);
		}
		expect(isTestMode()).to.be.false;
	});
});
