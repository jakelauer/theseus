import { expect } from "chai";
import { getSandboxChanges } from "../get-sandbox-changes.js";
import { CONSTANTS } from "sandbox-constants";

describe("getSandboxChanges", function () 
{
	it("should return changes when input is a sandbox proxy", function () 
	{
		const changes = {
			some: "changes",
		};
		const sandbox = {
			some: "unchanged",
			[CONSTANTS.SANDBOX_SYMBOL]: {
				changes,
			},
		};

		const result = getSandboxChanges(sandbox);

		expect(result).to.deep.equal(changes);
	});

	it("should throw an error when input is not a sandbox proxy", function () 
	{
		const nonSandboxObject = {};

		expect(() => getSandboxChanges(nonSandboxObject)).to.throw("The provided object is not a sandbox.");
	});
});
