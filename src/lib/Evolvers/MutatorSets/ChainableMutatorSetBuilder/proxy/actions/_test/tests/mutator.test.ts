import { expect } from "chai";
import type { ProxyActionMapParameters } from "../../../proxy-action-map";
import { MutatorAction } from "../../mutator";

describe("MutatorAction", function() 
{
	let mutatorAction: MutatorAction;
	let params: ProxyActionMapParameters;

	beforeEach(function() 
	{
		mutatorAction = new MutatorAction();
		params = { target: { mutatorsForProxy: { mutate: () => {} } }, prop: "mutate", proxy: {} } as any;
	});

	it("should return true for mutation properties in runTest", function() 
	{
		expect(mutatorAction.runTest(params)).to.be.true;
	});

	it("should return false for non-mutation properties in runTest", function() 
	{
		expect(mutatorAction.runTest({
			...params,
			target: {},
		})).to.be.false;
	});
});
