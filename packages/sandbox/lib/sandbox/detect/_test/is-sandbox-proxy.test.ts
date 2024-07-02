import { describe } from "mocha";
import { sandbox } from "../../sandbox";
import { containsSandboxProxy, isSandboxProxy } from "../is-sandbox-proxy";
import { expect } from "chai";

describe("is-sandbox-proxy", function()
{
	it("should correctly identify a sandbox proxy object", function() 
	{
		const original = {
			a: 1,
			b: 2, 
		};
		const proxy = sandbox(original);
		expect(isSandboxProxy(proxy)).to.equal(true);
	});

	it("should correctly identify a non-sandbox proxy object", function() 
	{
		const original = {
			a: 1,
			b: 2, 
		};
		expect(isSandboxProxy(original)).to.equal(false);
	});

	it("should correctly identify a nested sandbox proxy object", function()
	{
		const original = {
			a: 1,
			b: sandbox({
				c: 3,
				d: 4, 
			}), 
		};
		expect(containsSandboxProxy(original)).to.equal(true);
	});
});
