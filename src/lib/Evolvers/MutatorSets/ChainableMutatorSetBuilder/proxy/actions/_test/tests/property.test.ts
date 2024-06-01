import { expect } from "chai";
import type { ProxyActionMapParameters } from "../../../proxy-action-map";
import { ProxyActionType } from "../../../proxy-actions";
import { PropertyAction } from "../../property";

describe("PropertyAction", function() 
{
	let propertyAction: PropertyAction;
	let params: ProxyActionMapParameters;

	beforeEach(function() 
	{
		propertyAction = new PropertyAction();
		params = { target: { prop1: "value1" }, prop: "prop1", proxy: {} } as any;
	});

	it("should return true for existing properties in runTest", function() 
	{
		expect(propertyAction.runTest(params, ProxyActionType.none)).to.be.true;
	});

	it("should return false for non-existing properties in runTest", function() 
	{
		params.prop = "notExist";
		expect(propertyAction.runTest(params, ProxyActionType.none)).to.be.false;
	});

	it("should return property value in process", function() 
	{
		expect(propertyAction.process(params)).to.equal("value1");
	});
});
