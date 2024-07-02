import { describe } from "mocha";
import { frost } from "../../frost";
import { containsFrost, isFrost } from "../is-frost-proxy";
import { expect } from "chai";

describe("is-frost-proxy", function()
{
	it("should correctly identify a sandbox proxy object", function() 
	{
		const original = {
			a: 1,
			b: 2, 
		};
		const proxy = frost(original);
		expect(isFrost(proxy)).to.equal(true);
	});

	it("should correctly identify a non-sandbox proxy object", function() 
	{
		const original = {
			a: 1,
			b: 2, 
		};
		expect(isFrost(original)).to.equal(false);
	});

	it("should correctly identify a nested sandbox proxy object", function()
	{
		const original = {
			a: 1,
			b: frost({
				c: 3,
				d: 4, 
			}), 
		};
		expect(containsFrost(original)).to.equal(true);
		expect(isFrost(original, "every")).to.equal(false);
		expect(isFrost(original, "some")).to.equal(true);
	});
});
