import { expect } from "chai";
import { reject } from "../";
import { isSandboxProxy } from "../../sandbox";
import { CONSTANTS } from "../../constants";

describe("reject", function() 
{
	it("should return the original object if it is a sandbox proxy", function() 
	{
		const original = { key: "value" };
		const proxy = { [CONSTANTS.PROP_PREFIX]: { original } };
    
		// Mock the isSandboxProxy function to return true
		isSandboxProxy(proxy);
		expect(reject(proxy)).to.equal(original);
	});

	it("should return the object itself if it is not a sandbox proxy", function() 
	{
		const obj = { key: "value" };
		// Mock the isSandboxProxy function to return false
		isSandboxProxy(obj);
		expect(reject(obj)).to.equal(obj);
	});
});
