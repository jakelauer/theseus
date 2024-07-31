import {
	beforeEach, describe, it, expect, vi,
} from "vitest";

import { Theseus } from "@/Theseus";
import { theseus, Evolver } from "../index.js";

describe("Observation", () => 
{
	let observation: Theseus<{ test: string }>;

	beforeEach(() => 
	{
		observation = Theseus.__private_create<{ test: string }>({
			test: "initial", 
		});
	});

	it("should initialize with provided initial data", () => 
	{
		// JSON.stringify ignores symbols, which helpfully avoids sandbox symbols
		expect(JSON.stringify(observation.state)).to.equal(JSON.stringify({
			test: "initial", 
		}));
	});

	it("should allow observers to subscribe and receive updates", async () => 
	{
		const callback = vi.fn();
		observation.observe(callback);

		await observation["update"]({
			test: "updated", 
		});
		expect(callback).toHaveBeenCalledWith({
			test: "updated", 
		});

		return;
	});

	it("should allow observers to subscribe and receive initial state immediately if requested", async () => 
	{
		const callback = vi.fn();
		observation.observe(callback, true);

		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(callback).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenCalledWith({
			test: "initial", 
		});

		return;
	});

	it("should not call observers immediately if updateImmediately is false", () => 
	{
		const callback = vi.fn();
		observation.observe(callback, false);

		expect(callback).not.toHaveBeenCalled();
	});

	it("should correctly update the state and notify observers", async () => 
	{
		const callback = vi.fn();
		observation.observe(callback);

		await observation["update"]({
			test: "new value", 
		});
		expect(JSON.stringify(observation.state)).toEqual(JSON.stringify({
			test: "new value", 
		}));
		expect(callback).toHaveBeenCalledWith({
			test: "new value", 
		});

		return;
	});

	it("should correctly handle instance retrieval and updates by ID", async () => 
	{
		const id = observation.__uuid;
		const callback = vi.fn();
		observation.observe(callback);

		await Theseus.updateInstance(id, {
			test: "static update", 
		});

		// Since updateInstance is async, we may need to wait or use fake timers
		// This example assumes immediate update for simplicity
		expect(callback).toHaveBeenCalledWith({
			test: "static update", 
		});

		return;
	});

	it("should correctly return changes made to the state when requested", async () => 
	{
		const data = {
			myString: "happy", 
		};
		const instance = theseus(data).maintainWith({
			evolvers: [
				Evolver.create("TestEvolver", {
					noun: "data", 
				}).toEvolve<{ myString: string }>().withMutators({
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
		expect(changes).to.deep.equal({
			myString: "yppah", 
		});

		return;
	});

	it("should not broadcast changes when evolver is called from within an evolver", async function() 
	{
		const data = {
			myString: "happy", 
		};
		const instance = theseus(data).maintainWith({
			evolvers: [
				Evolver.create("TestEvolver", {
					noun: "data", 
				}).toEvolve<{ myString: string }>().withMutators({
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
	
		const callback = vi.fn();

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
				if (callback.mock.calls.length > 0) 
				{
					clearInterval(interval);
					callback.mock.calls.length === 1 
						? resolve() 
						: reject(new Error(`Callback was called ${callback.mock.calls.length} times`));
				}
			}, 50);

			setTimeout(() => 
			{
				clearInterval(interval);
				callback.mock.calls.length === 1 
					? resolve()
					: reject(new Error(`Callback was called ${callback.mock.calls.length} times`));
			}, 1000);
		});

		expect(callback).toHaveBeenCalledTimes(1);
	  });
});
