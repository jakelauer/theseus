import sinon from "sinon";
import {
	expect, afterEach, beforeEach, describe, it, 
} from "vitest";
import { ProxyActionType, ProxyActions } from "../proxy-actions.js";
import { getTheseusLogger } from "theseus-logger";
import type { ProxyActionMapParameters } from "../proxy-action-map.js";

// Create a mock subclass of ProxyActions for testing
class MockProxyActions extends ProxyActions 
{
	public readonly type = ProxyActionType.none;
	public runTest(params: ProxyActionMapParameters, matchedRequestTypes: ProxyActionType): boolean 
	{
		return true;
	}
	public process(params: ProxyActionMapParameters, requestType: ProxyActionType): any 
	{
		return null;
	}
}

describe("ProxyActions", function () 
{
	let mockProxyActions: MockProxyActions;
	let logDebugStub: sinon.SinonSpy;

	beforeEach(function () 
	{
		mockProxyActions = new MockProxyActions();
		logDebugStub = sinon.spy(getTheseusLogger("proxy-actions"), "debug");
	});

	afterEach(function () 
	{
		sinon.restore();
	});

	describe("test", function () 
	{
		it("should call runTest with correct parameters and log the appropriate message when outcome is true", function () 
		{
			const params: ProxyActionMapParameters = {
				prop: "testProp1",
			} as any;
			const matchingRequestTypes = ProxyActionType.function;

			const runTestStub = sinon.stub(mockProxyActions, "runTest").returns(true);

			const result = mockProxyActions.test(params, matchingRequestTypes);

			expect(runTestStub.calledOnceWithExactly(params, matchingRequestTypes)).to.be.true;
			expect(result).to.be.true;
		});

		it("should call runTest with correct parameters and not log any message when outcome is false", function () 
		{
			const params: ProxyActionMapParameters = {
				prop: "testProp2",
			} as any;
			const matchingRequestTypes = ProxyActionType.function;

			const runTestStub = sinon.stub(mockProxyActions, "runTest").returns(false);

			const result = mockProxyActions.test(params, matchingRequestTypes);

			expect(result).to.be.false;
			expect(runTestStub.calledOnceWithExactly(params, matchingRequestTypes)).to.be.true;
			expect(logDebugStub.called).to.be.false;
		});
	});
});
