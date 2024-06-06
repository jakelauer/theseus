import { expect } from "chai";
import { sandbox, isSandboxProxy } from "../index";

describe("sandbox", function() 
{
	it("should create a sandbox proxy for the given object", function() 
	{
		const original = { a: 1, b: 2 };
		const proxy = sandbox(original);
		expect(proxy).not.to.equal(original);
		expect(proxy.a).to.equal(1);
		expect(proxy.b).to.equal(2);
	});

	it('should allow modifications if the mode is "modify"', function() 
	{
		const original = { a: 1, b: 2 };
		const proxy = sandbox(original, { mode: "modify" });
		proxy.a = 3;
		expect(proxy.a).to.equal(3);
		expect(original.a).to.equal(1);  // original should not be modified
	});

	it('should allow modifications if the mode is "copy"', function() 
	{
		const original = { a: 1, b: 2 };
		const proxy = sandbox(original, { mode: "copy" });
		expect(() => 
		{
			proxy.a = 3;
		}).not.to.throw();
	});

	it("should track changes made to the proxy object", function() 
	{
		const original = { a: 1, b: 2 };
		const proxy = sandbox(original);
		proxy.a = 3;
		expect((proxy as any).__sandbox__.changes.a).to.equal(3);
	});

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
