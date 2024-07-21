import { expect } from "chai";
import sinon from "sinon";
import type { ProxyActionMapParameters } from "../../../proxy-action-map.js";
import { ChainTerminationAction } from "../../chain-termination.js";

describe("ChainTerminationAction", function () 
{
	let chainTerminationAction: ChainTerminationAction;
	let params: ProxyActionMapParameters;

	beforeEach(function () 
	{
		chainTerminationAction = new ChainTerminationAction();
		params = {
			prop: "end",
			proxy: {} as any,
			proxyManager: {
				onChainEnd: () => {},
				queue: {
					asyncEncountered: false,
					queue: [],
				} as any,
				params: {
					target: {
						result: "resultValue",
					},
				} as any,
			} as any,
		} as any;
	});

	it("should return true for matched properties in runTest", function () 
	{
		expect(chainTerminationAction.runTest(params)).to.be.true;
		params.prop = "lastly";
		expect(chainTerminationAction.runTest(params)).to.be.true;
	});

	it("should return false for unmatched properties in runTest", function () 
	{
		params.prop = "notMatched";
		expect(chainTerminationAction.runTest(params)).to.be.false;
	});

	it("should call onChainEnd and return the appropriate value in process", function () 
	{
		const proxyManager = {
			onChainEnd: sinon.spy(),
			queue: {
				asyncEncountered: false,
				queue: [],
			},
			params: {
				target: {
					end: () => "resultValue",
				},
			},
		};
		params.proxyManager = proxyManager as any;
		const processResult = chainTerminationAction.process(params) as any;
		expect(processResult()).to.equal("resultValue");
		sinon.assert.calledOnce(proxyManager.onChainEnd);
	});
});
