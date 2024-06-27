import { expect } from "chai";
import {
	defrost, frost, isFrostProxy, 
} from "../frost";
import { sandbox } from "../../sandbox/sandbox";
import { cement } from "../../cement/cement";
import { isSandboxProxy } from "../../sandbox";

function expectAllLayersToBeFrostProxies(obj) 
{
	if (typeof obj !== "object" || obj === null) 
	{
		return;
	}
	expect(isFrostProxy(obj)).to.be.true;
	Object.values(obj).forEach(expectAllLayersToBeFrostProxies);
}

function expectNoLayersToBeFrostProxies(obj) 
{
	if (typeof obj !== "object" || obj === null) 
	{
		return;
	}
	expect(isFrostProxy(obj)).to.be.false;
	Object.values(obj).forEach(expectNoLayersToBeFrostProxies);
}

describe("frost", function() 
{
	let originalObject: {[key: string]: number};
	let frostedProxy: {[key: string]: number};

	beforeEach(function() 
	{
		originalObject = {
			a: 1,
			b: 2, 
		};
		frostedProxy = frost(originalObject);
	});

	it("should return a proxy object", function() 
	{
		expect(frostedProxy).to.be.a("object");
		expect(frostedProxy).to.not.equal(originalObject);
	});

	it("should not allow modification of property", function() 
	{
		expect(() => 
		{
			frostedProxy.a = 3;
		}).to.throw("Cannot modify property \"a\" of the original object.");
	});

	it("should not allow deletion of property", function() 
	{
		expect(() => 
		{
			delete frostedProxy.a;
		}).to.throw("Cannot modify property \"a\" of the original object.");
	});

	it("should allow modification of a property via sandbox", function()
	{
		const sandboxFrostedProxy = sandbox(frostedProxy, {
			mode: "modify", 
		});
		expect(() => 
		{
			sandboxFrostedProxy.a = 3;
		}).to.not.throw();
	});

	it("should allow deletion of a property via sandbox", function()
	{
		const sandboxFrostedProxy = sandbox(frostedProxy, {
			mode: "modify", 
		});
		expect(() => 
		{
			delete sandboxFrostedProxy.a;
		}).to.not.throw();
	});

	it("should allow cementing of a frosted sandbox with deletion", function()
	{
		const sandboxFrostedProxy = sandbox(frostedProxy, {
			mode: "modify", 
		});
		delete sandboxFrostedProxy.a;
		cement(sandboxFrostedProxy);
	});


	it("should allow cementing of a frosted sandbox with change", function()
	{
		const sandboxFrostedProxy = sandbox(frostedProxy, {
			mode: "modify", 
		});
		sandboxFrostedProxy.a = 5;
		const result = cement(sandboxFrostedProxy);
		expect(result.a).to.equal(5);
		expect(sandboxFrostedProxy.a).to.equal(5);
		expect(frostedProxy.a).to.equal(5);
	});

	it("should get same stringified value for frosted proxy and original object", function()
	{
		const sandboxFrostedProxy = sandbox(frostedProxy, {
			mode: "modify", 
		});
		sandboxFrostedProxy.a = 5;
		const result = cement(sandboxFrostedProxy);

		expect(JSON.stringify(result))
			.to.equal(JSON.stringify(frostedProxy))
			.to.equal(JSON.stringify(sandboxFrostedProxy))
			.to.equal(JSON.stringify(originalObject));
	});

	it("should not get same stringified value for frosted proxy and original object", function()
	{
		const sandboxFrostedProxy = sandbox(frostedProxy, {
			mode: "copy", 
		});
		sandboxFrostedProxy.a = 5;
		const result = cement(sandboxFrostedProxy);

		expect(JSON.stringify(result))
			.not.to.equal(JSON.stringify(frostedProxy))
			.not.to.equal(JSON.stringify(originalObject));

		expect(result.a).to.equal(5);
		expect(frostedProxy.a).to.equal(1);
		expect(originalObject.a).to.equal(1);
	});

	describe("Defrosting a Frosted Object", function() 
	{
		let original;
		let frosted;
	
		beforeEach(function() 
		{
			original = {
				layer1: {
					layer2: {
						layer3: {
							a: 1,
						},
					},
				},
			};
			frosted = frost(original);
		});
	
		it("should frost an object correctly", function() 
		{
			expect(frosted).not.to.equal(original);
			expectAllLayersToBeFrostProxies(frosted);
		});
	
		it("should allow modification in a sandbox", function() 
		{
			const sb = sandbox(frosted);
			sb.layer1.layer2.layer3.a = 5;
			const cemented = cement(sb);
			expect(isSandboxProxy(cemented.layer1)).to.be.false;
			expect(cemented.layer1.layer2.layer3.a).to.equal(5);
		});
	
		it("should defrost an object correctly", function() 
		{
			const sb = sandbox(frosted);
			sb.layer1.layer2.layer3.a = 5;
			const cemented = cement(sb);
			const defrosted = defrost(cemented);
			expect(defrosted).to.equal(original);
			expectNoLayersToBeFrostProxies(defrosted);
			expect(defrosted.layer1.layer2.layer3.a).to.equal(5);
		});
	});

});
