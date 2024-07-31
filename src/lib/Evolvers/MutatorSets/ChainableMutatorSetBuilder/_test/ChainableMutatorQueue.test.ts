import {
	expect, afterEach, beforeEach, describe, it, vi,
} from "vitest";

import { ChainableMutatorQueue } from "../ChainableMutatorQueue.js";

import type { Mutator } from "@Evolvers/Types/MutatorTypes";

describe("ChainableMutatorQueue", function () 
{
	beforeEach(function () 
	{
		vi.useFakeTimers();
	});

	afterEach(function () 
	{
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it("should process synchronous mutators in sequence", function () 
	{
		const paramNoun = "testArg";
		let testData: { value: number } = {
			value: 1,
		};
        type TData = { value: number };

        const setData = (data: any) => 
        {
        	testData = data;
        };
        const getData = () => testData;
        const syncMutator: Mutator<any, any, TData> = (testArg: TData, increment: number) => 
        {
        	testArg.value += increment;

        	return testArg;
        };

        const queue = ChainableMutatorQueue.create({
        	paramNoun,
        	getData: getData,
        	setData: setData,
        });

        void queue.queueMutation("syncMutatorPath", syncMutator, [testData, 1]);
        void queue.queueMutation("syncMutatorPath", syncMutator, [testData, 2]);

        expect(testData).to.deep.equal({
        	value: 4,
        });
	});

	it("should handle asynchronous mutators correctly", async () => 
	{
		const paramNoun = "testArg";
		let testData: { value: number } = {
			value: 1,
		};
        type TData = { value: number };

        const setData = (data: any) => 
        {
        	testData = data.testArg;
        };

        const getData = () => testData;
        const asyncMutator: Mutator<any, any, Promise<TData>> = async (testArg: TData, increment: number) => 
        {
        	return new Promise((resolve) => 
        	{
        		testArg.value += increment;
        		vi.advanceTimersByTime(50); // Use vi.advanceTimersByTime instead of setTimeout
        		resolve(testArg);
        	});
        };

        const queue = ChainableMutatorQueue.create({
        	paramNoun,
        	getData: getData,
        	setData: setData,
        });

        let q = queue.queueMutation("asyncMutatorPath", asyncMutator, [testData, 1]);
        q = queue.queueMutation("asyncMutatorPath", asyncMutator, [testData, 2]);

        const result = await q;

        expect(result).to.deep.equal({
        	value: 4,
        });
	}, 15000); // Set timeout to 15 seconds

	it("should log an error if a mutator returns undefined", function () 
	{
		const paramNoun = "undefinedReturnArg" as string;
		const setData = vi.fn();
		const getData = vi.fn().mockReturnValue({
			[paramNoun]: {
				value: 0,
			},
		});
		const undefinedMutator = () => undefined;

		const queue = ChainableMutatorQueue.create({
			paramNoun,
			getData: getData,
			setData: setData,
		});

		expect(() => queue.queueMutation("undefinedMutatorPath", undefinedMutator as any, [])).to.throw(
			"Mutator undefinedMutatorPath returned undefined. Mutators must return a value compatible with the data type.",
		);
	});

	it("should log an error if a mutator returns the wrong type", function () 
	{
		const paramNoun = "undefinedReturnArg" as string;
		const setData = vi.fn();
		const getData = vi.fn().mockReturnValue({
			[paramNoun]: {
				value: 0,
			},
		});
		const stringMutator = () => "not an object" as any;

		const queue = ChainableMutatorQueue.create({
			paramNoun,
			getData: getData,
			setData: setData,
		});

		expect(() => queue.queueMutation("numberToStringMutatorPath", stringMutator, [])).to.throw(
			'Expected mutator numberToStringMutatorPath to return an object, but got type "string" from value "not an object".',
		);
	});

	it("should log an error if a mutator returns the wrong type async", async function () 
	{
        type Data = { undefinedReturn: number };
        const paramNoun = "undefinedReturn";
        const setData = vi.fn();
        const getData = vi.fn().mockReturnValue({
        	[paramNoun]: 0,
        });
        const numberToStringMutator = async () => 
        {
        	return Promise.resolve("not a number") as unknown as Data;
        };

        const queue = ChainableMutatorQueue.create<Data, typeof paramNoun>({
        	paramNoun,
        	getData: getData,
        	setData: setData,
        });

        try 
        {
        	await queue.queueMutation("numberToStringMutatorPath", numberToStringMutator, []);

        	expect.fail("Expected an error to be thrown");
        }
        catch (e) 
        {
        	expect(e.message).to.equal(
        		'Expected mutator numberToStringMutatorPath to return an object, but got type "string" from value "not a number".',
        	);
        }

        return;
	});

	it("should have a theseus ID if created by Theseus", function () 
	{
		const paramNoun = "testArg";
		const setData = vi.fn();
		const getData = vi.fn().mockReturnValue({
			[paramNoun]: {
				value: 0,
			},
		});
		const queue = ChainableMutatorQueue.create({
			paramNoun,
			getData: getData,
			setData: setData,
			__theseusId: "testId",
		});

		expect(queue["params"]).to.have.property("__theseusId", "testId");
	});
});
