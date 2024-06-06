import { expect } from "chai";
import { cement } from "../";
import { isSandboxProxy } from "../../sandbox";
import { CONSTANTS } from "../../constants";

describe("cement", function() 
{
	it("should modify the original object if it is a sandbox proxy in modify mode", function() 
	{
		const original = { key1: "value1", key2: "value2" };
		const changes = { key2: "newValue2", key3: "value3" };
		const proxy = { 
			[CONSTANTS.PROP_PREFIX]: { 
				original, 
				changes, 
				params: { mode: "modify" }, 
			}, 
		};

		// Mock the isSandboxProxy function to return true
		isSandboxProxy(proxy);
		const result = cement(proxy);
		expect(result).to.equal(original);  // Ensure that the result is the original object
		expect(result).to.deep.equal({ key1: "value1", key2: "newValue2", key3: "value3" });
	});

	it("should return a new object with changes applied if it is a sandbox proxy in copy mode", function() 
	{
		const original = { key1: "value1", key2: "value2" };
		const changes = { key2: "newValue2", key3: "value3" };
		const proxy = { 
			[CONSTANTS.PROP_PREFIX]: { 
				original, 
				changes, 
				params: { mode: "copy" }, 
			}, 
		};

		// Mock the isSandboxProxy function to return true
		isSandboxProxy(proxy);
		const result = cement(proxy);
		expect(result).to.deep.equal({ key1: "value1", key2: "newValue2", key3: "value3" });
		expect(result).to.not.equal(original);  // Ensure that the result is a new object
	});

	it("should return the object itself if it is not a sandbox proxy", function() 
	{
		const obj = { key: "value" };
		// Mock the isSandboxProxy function to return false
		isSandboxProxy(obj);
		expect(cement(obj)).to.equal(obj);
	});
});
