import { expect } from "chai";
import type { ProxyActionMapParameters } from "../../../proxy-action-map.js";
import { ToJsonAction } from "../../to-json.js";

describe("ToJsonAction", function () 
{
	let toJsonAction: ToJsonAction;
	let params: ProxyActionMapParameters;

	beforeEach(function () 
	{
		toJsonAction = new ToJsonAction();
		params = {
			target: {
				prop: "value",
			},
			prop: "toJSON",
			proxy: {},
		} as any;
	});

	it("should return true for toJSON property in runTest", function () 
	{
		expect(toJsonAction.runTest(params)).to.be.true;
	});

	it("should return serialized object in process", function () 
	{
		const result = toJsonAction.process(params);
		expect(result()).to.deep.equal({
			prop: "value",
		});
	});
});
