import { expect } from "chai";

import { createChainingProxy } from "../createChainingProxy";
import { ChainableMutatorQueue } from "../ChainableMutatorQueue";

const makeMutatorQueue = () => 
{
	let dataReference = { value: 0 };
	return ChainableMutatorQueue.create({
		paramNoun: "data",
		setData: ({ data }) => 
		{
			if (data instanceof Promise) 
			{
				throw new Error("Cannot set data to a Promise.");
			}
			dataReference = data;
		},
		getData: () => ({ data: dataReference }),
	});
};

describe("createChainingProxy", function () 
{
	let queueMutation: ReturnType<typeof makeMutatorQueue>["queueMutation"];

	beforeEach(function () 
	{
		queueMutation = makeMutatorQueue().queueMutation;
	});

	it("should allow method chaining and return proxy for chainable methods", function () 
	{
		const target: any = {
			fixedMutators: {
				chainableMethod: () => ({}),
			},
		};
		const proxy = createChainingProxy({
			target,
			queue: makeMutatorQueue(),
		});

		expect(proxy.chainableMethod()).to.equal(proxy);
	});

	it("should handle end of chain indicators correctly", function () 
	{
		let finalChainLinkReached = false;
		const target: any = {
			do: () => 
			{
				finalChainLinkReached = true;
			},
		};
		const proxy = createChainingProxy({
			target,
			queue: makeMutatorQueue(),
		});

		proxy.do();
		expect(finalChainLinkReached).to.be.true;
	});

	it("should queue functions correctly via queueMutation", function () 
	{
		let queuedFunctionCalled = false;
		const target: any = {
			toBeQueued: () => 
			{
				queuedFunctionCalled = true;
			},
		};
		const proxy = createChainingProxy({
			target,
			queue: makeMutatorQueue(),
		});

		proxy.toBeQueued();
		expect(queuedFunctionCalled).to.be.true;
	});

	it("should return correct values for non-function properties", function () 
	{
		const target: any = {
			someProperty: "value",
		};
		const proxy = createChainingProxy({
			target,
			queue: makeMutatorQueue(),
		});

		expect(proxy.someProperty).to.equal("value");
	});

	it("should throw an error when accessing undefined properties", function () 
	{
		const target: any = {};
		const proxy = createChainingProxy({
			target,
			queue: makeMutatorQueue(),
		});

		expect(() => (proxy as any).undefinedProperty).to.throw(
			Error,
			'Property or action "undefinedProperty" not found in target',
		);
	});

	it("should correctly handle exceptions thrown in queued functions", function () 
	{
		const errorMessage = "Error in queued function";
		const target: any = {
			throwError: () => 
			{
				throw new Error(errorMessage);
			},
		};
		const proxy = createChainingProxy({
			target,
			queue: makeMutatorQueue(),
		});

		expect(() => proxy.throwError()).to.throw(Error, errorMessage);
	});

	it("should maintain the order of queued mutations", function () 
	{
		const order: number[] = [];
		const target = {
			fixedMutators: {
				first: ({ data }: any) => 
				{
					order.push(1);

					return data;
				},
				second: ({ data }: any) => 
				{
					order.push(2);

					return data;
				},
			},
		};
		const proxy = createChainingProxy<any>({
			target,
			queue: makeMutatorQueue(),
		});

		proxy
			.first()
			.second();
		expect(order).to.deep.equal([1, 2]);
	});

	it("should return correct result from a queued function not meant for further chaining", function () 
	{
		const expectedResult = 42;
		const target = {
			calculate: () => expectedResult,
		};
		const proxy = createChainingProxy<any>({
			target,
			queue: makeMutatorQueue(),
		});

		const result = proxy
			.lastly.calculate();
		expect(result).to.equal(expectedResult);
	});

	it("should handle asynchronous method calls correctly", async function () 
	{
		let asyncOperationCompleted = false;
		const target = {
			asyncMethod: () =>
				new Promise((resolve) =>
					setTimeout(() => 
					{
						asyncOperationCompleted = true;
						resolve(true);
					}, 10),
				),
		};
		const proxy = createChainingProxy<any>({
			target,
			queue: makeMutatorQueue(),
		});

		await proxy
			.lastly.asyncMethod();
		expect(asyncOperationCompleted).to.be.true;
	});
});
