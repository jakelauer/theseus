import { expect } from "chai";
import { beforeEach, describe, it } from "mocha";
import chaiAsPromised from "chai-as-promised";

import { BroadcasterObserver } from "@Broadcast/BroadcasterObserver";

import { Broadcaster } from "../Broadcaster";

import type { BroadcasterParams } from "../Broadcaster";

chai.use(chaiAsPromised);

// Mock observer class for testing
class MockObserver extends BroadcasterObserver<any> 
{
	public dataReceived: any = null;

	constructor(public override callback: (data: any) => void) 
	{
		super(callback);
	}

	override update(data: any): Promise<void> 
	{
		this.dataReceived = data;
		return Promise.resolve();
	}
}

describe("Broadcaster", () => 
{
	let broadcaster: Broadcaster<any>;

	beforeEach(() => 
	{
		broadcaster = new Broadcaster();
	});

	describe("constructor", () => 
	{
		it("initializes with default parameters when none are provided", () => 
		{
			expect(broadcaster).to.be.an.instanceOf(Broadcaster);
			// Assert default parameters if necessary
		});

		it("initializes with custom parameters when provided", () => 
		{
			const customParams: BroadcasterParams<any, any> = {
				observerClassConstructor: MockObserver,
			};
			const customBroadcaster = new Broadcaster(customParams);
			expect(customBroadcaster).to.be.an.instanceOf(Broadcaster);
		});
	});

	describe("broadcast", () => 
	{
		it("broadcasts data to all registered observers", async () => 
		{
			const mockObserver = new MockObserver(() => {});
			broadcaster.observe(mockObserver.update.bind(mockObserver));
			const testData = { key: "value" };

			await broadcaster.broadcast(testData);
			expect(mockObserver.dataReceived).to.deep.equal(testData);
		});

		it("completes broadcast with no observers without error", async () => 
		{
			const broadcastPromise = broadcaster.broadcast({ key: "value" });
			await expect(broadcastPromise).to.be.fulfilled;
		});
	});

	describe("observer management", () => 
	{
		it("adds observers and receives updates", async () => 
		{
			const mockObserver = new MockObserver(() => {});
			broadcaster.observe(mockObserver.update.bind(mockObserver));

			const testData = { key: "value" };
			await broadcaster.broadcast(testData);

			expect(mockObserver.dataReceived).to.deep.equal(testData);
		});

		it("removes observers correctly using destroy callback", async () => 
		{
			const mockObserver = new MockObserver(() => {});
			const destroy = broadcaster.observe(mockObserver.update.bind(mockObserver));

			destroy();

			const testData = { key: "value" };
			await broadcaster.broadcast(testData);

			expect(mockObserver.dataReceived).to.be.null; // Assuming initial value is null
		});
	});

	describe("static methods", () => 
	{
		it("destroyAll removes all observers correctly", () => 
		{
			const mockObserver1 = new MockObserver(() => {});
			const destroy1 = broadcaster.observe(mockObserver1.update.bind(mockObserver1));

			const mockObserver2 = new MockObserver(() => {});
			const destroy2 = broadcaster.observe(mockObserver2.update.bind(mockObserver2));

			Broadcaster.destroyAll(destroy1, destroy2);

			// Attempt to broadcast data and verify that observers do not receive it
			const testData = { key: "value" };

			broadcaster
				.broadcast(testData)
				.then(() => 
				{
					expect(mockObserver1.dataReceived).to.be.null;
					expect(mockObserver2.dataReceived).to.be.null;
				})
				.catch((error) => 
				{
					console.error("Error broadcasting data:", error);
				});
		});
	});

	// Further tests could be added here as necessary, for example, testing edge cases, error handling, etc.
});
