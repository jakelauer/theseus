import { expect } from "chai";
import type { ProxyActionMapParameters } from "../../proxy-action-map.js";
import { ChainHelperAction } from "../chain-helper.js";

describe("ChainHelperAction", function () 
{
	let chainHelperAction: ChainHelperAction;
	let params: ProxyActionMapParameters;

	beforeEach(function () 
	{
		chainHelperAction = new ChainHelperAction();
		params = {
			prop: "and",
			proxy: {} as any,
			proxyManager: null as any,
			target: null,
		};
	});

	it("should return true for matched properties in runTest", function () 
	{
		expect(chainHelperAction.runTest(params)).to.be.true;
		params.prop = "lastly";
		expect(chainHelperAction.runTest(params)).to.be.true;
	});

	it("should return false for unmatched properties in runTest", function () 
	{
		params.prop = "notMatched";
		expect(chainHelperAction.runTest(params)).to.be.false;
	});

	it("should return the proxy in process method", function () 
	{
		const proxy = {
			test: "proxy",
		};
		params.proxy = proxy as any;
		expect(chainHelperAction.process(params)).to.equal(proxy);
	});
});
