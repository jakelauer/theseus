import { expect } from "chai";
import { getSandboxChanges } from "../get-sandbox-changes";

describe("getSandboxChanges", function() 
{
	it("should return changes when input is a sandbox proxy", function() 
	{
		const changes = { some: "changes" };
		const sandboxProxy = {
			__sandbox__: {
				changes,
			},
		};

		const result = getSandboxChanges(sandboxProxy);

		expect(result).to.deep.equal(changes);
	});

	it("should throw an error when input is not a sandbox proxy", function() 
	{
		const nonSandboxObject = {};

		expect(() => getSandboxChanges(nonSandboxObject)).to.throw("The provided object is not a sandbox.");
	});
});
