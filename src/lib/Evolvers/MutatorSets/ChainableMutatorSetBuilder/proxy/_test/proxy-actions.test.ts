import {
	expect, afterEach, beforeEach, describe, it, vi,
	type MockInstance,
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
	let logDebugSpy: MockInstance<any, any>;

	beforeEach(function () 
	{
		mockProxyActions = new MockProxyActions();
		logDebugSpy = vi.spyOn(getTheseusLogger("proxy-actions"), "debug");
	});

	afterEach(function () 
	{
		vi.restoreAllMocks();
	});

	describe("test", function () 
	{
		it("should call runTest with correct parameters and log the appropriate message when outcome is true", function () 
		{
			const params: ProxyActionMapParameters = {
				prop: "testProp1",
			} as any;
			const matchingRequestTypes = ProxyActionType.function;

			const runTestStub = vi.spyOn(mockProxyActions, "runTest").mockReturnValue(true);

			const result = mockProxyActions.test(params, matchingRequestTypes);

			expect(runTestStub).toHaveBeenCalledOnce();
			expect(runTestStub).toHaveBeenCalledWith(params, matchingRequestTypes);
			expect(result).toBe(true);
		});

		it("should call runTest with correct parameters and not log any message when outcome is false", function () 
		{
			const params: ProxyActionMapParameters = {
				prop: "testProp2",
			} as any;
			const matchingRequestTypes = ProxyActionType.function;

			const runTestStub = vi.spyOn(mockProxyActions, "runTest").mockReturnValue(false);

			const result = mockProxyActions.test(params, matchingRequestTypes);

			expect(result).toBe(false);
			expect(runTestStub).toHaveBeenCalledOnce();
			expect(runTestStub).toHaveBeenCalledWith(params, matchingRequestTypes);
			expect(logDebugSpy).not.toHaveBeenCalled();
		});
	});
});
