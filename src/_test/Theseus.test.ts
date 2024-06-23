import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { beforeEach, describe, it } from "mocha";
import sinon, { type SinonSpy } from "sinon";

import { Theseus } from "@/Theseus";
import { theseus, Evolver } from "..";

chai.use(chaiAsPromised);

describe("Observation", () => 
{
	let observation: Theseus<{ test: string }>;

	beforeEach(() => 
	{
		observation = Theseus.__private_create<{ test: string }>({ test: "initial" });
	});

	it("should initialize with provided initial data", () => 
	{
		// JSON.stringify ignores symbols, which helpfully avoids sandbox symbols
		expect(JSON.stringify(observation.state)).to.equal(JSON.stringify({ test: "initial" }));
	});

	it("should allow observers to subscribe and receive updates", async () => 
	{
		const callback = sinon.fake();
		observation.observe(callback);

		await observation["update"]({ test: "updated" });
		expect(callback.calledWith({ test: "updated" })).to.be.true;

		return;
	});

	it("should allow observers to subscribe and receive initial state immediately if requested", async () => 
	{
		const callback = sinon.fake();
		observation.observe(callback, true);

		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(callback.calledOnce).to.be.true;
		expect(callback.calledWith({ test: "initial" })).to.be.true;

		return;
	});

	it("should not call observers immediately if updateImmediately is false", () => 
	{
		const callback = sinon.fake();
		observation.observe(callback, false);

		expect(callback.called).to.be.false;
	});

	it("should correctly update the state and notify observers", async () => 
	{
		const callback = sinon.fake();
		observation.observe(callback);

		await observation["update"]({ test: "new value" });
		expect(JSON.stringify(observation.state)).to.deep.equal(JSON.stringify({ test: "new value" }));
		expect(callback.calledWith({ test: "new value" })).to.be.true;

		return;
	});

	it("should correctly handle instance retrieval and updates by ID", async () => 
	{
		const id = observation.__uuid;
		const callback = sinon.fake();
		observation.observe(callback);

		await Theseus.updateInstance(id, { test: "static update" });

		// Since updateInstance is async, we may need to wait or use fake timers
		// This example assumes immediate update for simplicity
		expect(callback.calledWith({ test: "static update" })).to.be.true;

		return;
	});

	it("should correctly return changes made to the state when requested", async () => 
	{
		const data = { myString: "happy" };
		const instance = theseus(data).maintainWith({
			evolvers: [
				Evolver.create("TestEvolver", { noun: "data" }).toEvolve<{ myString: string }>().withMutators({
					reverse: ({ data }) => 
					{
						data.myString = data.myString.split("").reverse().join("");
						return data;
					},
				}),
			],
		});
		instance.evolve.Test.reverse();

		const changes = instance.evolve.Test.getChanges();
		expect(changes).to.deep.equal({ myString: "yppah" });

		return;
	});

	it("should not broadcast changes when evolver is called from within an evolver", async function() 
	{
		const data = { myString: "happy" };
		const instance = theseus(data).maintainWith({
			evolvers: [
				Evolver.create("TestEvolver", { noun: "data" }).toEvolve<{ myString: string }>().withMutators({
					reverse: ({ data }) => 
					{
						data.myString = data.myString.split("").reverse().join("");
						return data;
					},
					doubleReverse: ({ data }) => 
					{
						instance.mutate.Test.reverse();
						instance.mutate.Test.reverse();
						return data;
					},
				}),
			],
		});
	
		const callback: SinonSpy = sinon.spy();

		instance.observe(() => 
		{
			callback();
		});
	
		instance.mutate.Test.doubleReverse();

		// Use a promise to wait until the callback is called or the timeout is reached
		await new Promise<void>((resolve, reject) => 
		{
			const interval = setInterval(() => 
			{
				if (callback.callCount > 0) 
				{
					clearInterval(interval);
					callback.callCount === 1 
						? resolve() 
						: reject(new Error(`Callback was called ${callback.callCount} times`));
				}
			}, 50);

			setTimeout(() => 
			{
				clearInterval(interval);
				callback.callCount === 1 
					? resolve()
					: reject(new Error(`Callback was called ${callback.callCount} times`));
			}, 1000);
		});

		expect(callback.callCount).to.be.equal(1);
	  }).timeout(2000); // Ensure the test has enough time to complete
});
