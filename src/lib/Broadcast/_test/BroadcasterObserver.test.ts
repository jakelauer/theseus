import {
	beforeEach, describe, it, expect, vi,
} from "vitest";

import { BroadcasterObserver } from "@Broadcast/BroadcasterObserver";

describe("BroadcasterObserver", () => 
{
	let observer: BroadcasterObserver<any>;
	let callback: ReturnType<typeof vi.fn>;

	beforeEach(() => 
	{
		callback = vi.fn();
		observer = new BroadcasterObserver<any>(callback);
	});

	it("initializes with a callback function", () => 
	{
		// Ensure the observer is instantiated with the callback
		expect(observer).toBeInstanceOf(BroadcasterObserver);
		expect(callback).not.toHaveBeenCalled(); // Callback should not be called on instantiation
	});

	it("calls the callback with provided data asynchronously", async () => 
	{
		const testData = {
			key: "value", 
		};
		await observer.update(testData);

		expect(callback).toHaveBeenCalledOnce();
		expect(callback).toHaveBeenCalledWith(testData);

		// To validate asynchronous execution, you might check for behavior that can only result 
		// from asynchronous execution. This might involve checking states before and after promises 
		// resolve in real application scenarios.
	});

	it("rejects the promise if the callback throws an error", async () => 
	{
		const errorMessage = "Callback error";
		const errorThrowingObserver = new BroadcasterObserver<any>(() => 
		{
			throw new Error(errorMessage);
		});

		await expect(errorThrowingObserver.update({})).rejects.toThrow(errorMessage);
	});
});
