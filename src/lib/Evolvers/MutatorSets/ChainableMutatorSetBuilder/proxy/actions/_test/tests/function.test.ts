import { expect } from "chai";
import type { ProxyActionMapParameters } from "../../../proxy-action-map.js";
import { FunctionAction } from "../../function.js";

describe("FunctionAction", function () 
{
	let functionAction: FunctionAction;
	let params: ProxyActionMapParameters;

	beforeEach(function () 
	{
		functionAction = new FunctionAction();
		params = {
			target: () => {},
			prop: "apply",
			proxy: {} as any,
		} as any;
	});

	it("should return true for function type in runTest", function () 
	{
		expect(functionAction.runTest(params)).to.be.true;
	});

	it("should return false for non-function type in runTest", function () 
	{
		expect(
			functionAction.runTest({
				...params,
				target: {},
			}),
		).to.be.false;
	});
});
