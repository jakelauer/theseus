import { expect } from "chai";
import { frost } from "../frost.js";
import { sandbox } from "../../sandbox/sandbox.js";
import { cement } from "../../cement/cement.js";
import { isSandbox } from "../../sandbox/index.js";
import { isFrost } from "../detect/is-frost-proxy.js";
import { defrost } from "../defrost.js";

function expectAllLayersToBeFrostProxies(obj) 
{
	if (typeof obj !== "object" || obj === null) 
	{
		return;
	}
	expect(isFrost(obj, "every")).to.be.true;
}

function expectNoLayersToBeFrostProxies(obj) 
{
	if (typeof obj !== "object" || obj === null) 
	{
		return;
	}
	expect(isFrost(obj, "some")).to.be.false;
}

describe("frost", function () 
{
	describe("Defrosting a Frosted Object", function () 
	{
		let original;
		let frosted;

		beforeEach(function () 
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

		it("should frost an object correctly", function () 
		{
			expect(frosted).not.to.equal(original);
			expectAllLayersToBeFrostProxies(frosted);
		});

		it("should allow modification in a sandbox", function () 
		{
			const sb = sandbox(frosted);
			sb.layer1.layer2.layer3.a = 5;
			const cemented = cement(sb);
			expect(isSandbox(cemented.layer1)).to.be.false;
			expect(cemented.layer1.layer2.layer3.a).to.equal(5);
		});

		it("should defrost an object correctly", function () 
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
