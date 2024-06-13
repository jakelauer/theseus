import { describe } from "mocha";
import { sandbox } from "../sandbox";
import { isSandboxProxy } from "../is-sandbox-proxy";
import { expect } from "chai";

describe("is-sandbox-proxy", function()
{
	it("should correctly identify a sandbox proxy object", function() 
	{
		const original = { a: 1, b: 2 };
		const proxy = sandbox(original);
		expect(isSandboxProxy(proxy)).to.equal(true);
	});

	it("should correctly identify a non-sandbox proxy object", function() 
	{
		const original = { a: 1, b: 2 };
		expect(isSandboxProxy(original)).to.equal(false);
	});
});
