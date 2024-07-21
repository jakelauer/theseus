import { sandbox } from "../../sandbox.js";
import { expect, it } from "vitest";
import { containsSandbox, isSandbox } from "../is-sandbox-proxy.js";

"is-sandbox-proxy",
function () 
{
	it("should correctly identify a sandbox proxy object", function () 
	{
		const original = {
			a: 1,
			b: 2,
		};
		const proxy = sandbox(original);
		expect(isSandbox(proxy)).to.equal(true);
	});

	it("should correctly identify a non-sandbox proxy object", function () 
	{
		const original = {
			a: 1,
			b: 2,
		};
		expect(isSandbox(original)).to.equal(false);
	});

	it("should correctly identify a nested sandbox proxy object", function () 
	{
		const original = {
			a: 1,
			b: sandbox({
				c: 3,
				d: 4,
			}),
		};
		expect(containsSandbox(original)).to.equal(true);
	});
};
