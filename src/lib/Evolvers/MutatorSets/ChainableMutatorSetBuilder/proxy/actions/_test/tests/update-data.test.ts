import { expect } from "chai";
import type { ProxyActionMapParameters } from "../../../proxy-action-map";
import { UpdateDataAction } from "../../update-data";

describe("UpdateDataAction", function() 
{
	let updateDataAction: UpdateDataAction;
	let params: ProxyActionMapParameters;

	beforeEach(function() 
	{
		updateDataAction = new UpdateDataAction();
		params = {
			target: {
				replaceData: "newData", 
			},
			prop: "setData",
			proxy: {}, 
		} as any;
	});

	it("should return true for setData property in runTest", function() 
	{
		expect(updateDataAction.runTest(params)).to.be.true;
	});

	it("should return replaceData value in process", function() 
	{
		expect(updateDataAction.process(params)).to.equal("newData");
	});
});
