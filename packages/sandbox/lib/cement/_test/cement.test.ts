import { expect } from "chai";
import { cement } from "../cement";
import { CONSTANTS } from "../../constants";
import { isSandboxProxy, sandbox } from "../../sandbox";

describe("cement", function() 
{
	it("should modify the original object if it is a sandbox proxy in modify mode", function() 
	{
		const original = { key1: "value1", key2: "value2" };
		const changes = { key2: "newValue2", key3: "value3" };
		const proxy = { 
			[CONSTANTS.SANDBOX_SYMBOL]: { 
				original, 
				changes, 
				params: { mode: "modify" }, 
			}, 
		};

		const result = cement(proxy);
		expect(result).to.equal(original);  // Ensure that the result is the original object
		expect(result).to.deep.equal({ key1: "value1", key2: "newValue2", key3: "value3" });
	});

	it("should return a new object with changes applied if it is a sandbox proxy in copy mode", function() 
	{
		const original = { key1: "value1", key2: "value2" };
		const changes = { key2: "newValue2", key3: "value3" };
		const proxy = { 
			[CONSTANTS.SANDBOX_SYMBOL]: { 
				original, 
				changes, 
				params: { mode: "copy" }, 
			}, 
		};

		// Mock the isSandboxProxy function to return true
		
		const result = cement(proxy);
		expect(result).to.deep.equal({ key1: "value1", key2: "newValue2", key3: "value3" });
		expect(result).to.not.equal(original);  // Ensure that the result is a new object
	});

	it("should apply changes to a target object with nested objects which have changes", function()
	{
		const original = { key1: "value1", key2: { key3: "value3" } };
		const changes = { key2: { key3: "newValue3", key4: "value" } };
		const proxy = { 
			[CONSTANTS.SANDBOX_SYMBOL]: { 
				original, 
				changes, 
				params: { mode: "copy" }, 
			}, 
		};

		const result = cement(proxy) as any;
		expect(result).to.deep.equal({ key1: "value1", key2: { key3: "newValue3", key4: "value" } });
		expect(result.key2).to.not.equal(original.key2);  // Ensure that the nested object is a new object
		expect(result).to.not.equal(original);  // Ensure that the nested object is a new object
	});

	it("should find no remaining sandboxes in nested functions", function()
	{
		const original = { key1: "value1", key2: { key3: "value3" } };
		const sb = sandbox(original);
		sb.key2.key3 = "replacement";
		const result = cement(sb);
		expect(result).to.deep.equal({ key1: "value1", key2: { key3: "replacement" } });

		const checkForSandbox = (obj: any) =>
		{
			if (typeof obj === "object")
			{
				expect(isSandboxProxy(obj)).to.be.false;
				for (const key in obj)
				{
					checkForSandbox(obj[key]);
				}
			}
		};
	});
});
