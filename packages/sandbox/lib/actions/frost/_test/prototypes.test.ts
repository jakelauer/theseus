import { expect } from "chai";
import { isSandbox, sandbox } from "../../sandbox";

describe("Prototype tests", function()
{
	class TestClass
	{
		public a: number = 1;
		public b: number = 2;
	}

	it("should not sandbox objects which are instances of a class", function()
	{
		const original = new TestClass();
		const sb = sandbox(original);
		expect(isSandbox(sb)).to.equal(false);
		expect(sb).to.equal(original);
	});
});
