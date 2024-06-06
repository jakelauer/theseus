import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

import { ChainableMutatorQueue } from "../ChainableMutatorQueue";

import type { Mutator } from "@Evolvers/Types/MutatorTypes";

chai.use(chaiAsPromised);

describe("ChainableMutatorQueue", function () 
{
	let sandbox: sinon.SinonSandbox;

	beforeEach(function () 
	{
		sandbox = sinon.createSandbox();
	});

	afterEach(function () 
	{
		sandbox.restore();
	});

	it("should process synchronous mutators in sequence", function () 
	{
		const paramNoun = "testArg";
		let testData: {value: number} = { value: 1 };
        type TData ={value: number};

        const setData = (data: any) => 
        {
        	testData = data;
        };
        const getData = () => testData;
        const syncMutator: Mutator<any, any, TData> = (
        	testArg: TData,
        	increment: number,
        ) => 
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

        expect(testData).to.deep.equal({ value: 4 });
	});

	it("should handle asynchronous mutators correctly", async function () 
	{
		const paramNoun = "testArg";
		let testData: {value: number} = { value: 1 };
        type TData ={value: number};

        const setData = (data: any) => 
        {
        	testData = data.testArg;
        };

        const getData = () => testData;
        const asyncMutator: Mutator<any, any, Promise<TData>> = async (
        	testArg: TData,
        	increment: number,
        ) => 
        {
        	return new Promise((resolve) => 
        	{
        		testArg.value += increment;
        		setTimeout(() => 
        		{
        			resolve(testArg);
        		}, 50);
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

        expect(result).to.deep.equal({ value: 4 });
	});

	it("should log an error if a mutator returns undefined", function () 
	{
		const paramNoun = "undefinedReturnArg" as string;
		const setData = sinon.stub();
		const getData = sinon.stub().returns({ [paramNoun]: { value: 0 } });
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
		const setData = sinon.stub();
		const getData = sinon.stub().returns({ [paramNoun]: { value: 0 } });
		const stringMutator = () => "not an object" as any;

		const queue = ChainableMutatorQueue.create({
			paramNoun,
			getData: getData,
			setData: setData,
		});

		expect(() => queue.queueMutation("numberToStringMutatorPath", stringMutator, [])).to.throw(
			"Expected mutator numberToStringMutatorPath to return an object, but got type \"string\" from value \"not an object\".",
		);
	});

	it("should log an error if a mutator returns the wrong type async", async function () 
	{
		type Data = {"undefinedReturn": number};
		const paramNoun = "undefinedReturn";
		const setData = sinon.stub();
		const getData = sinon.stub().returns({ [paramNoun]: 0 });
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
		        "Expected mutator numberToStringMutatorPath to return an object, but got type \"string\" from value \"not a number\".",
		    );
		}

		return;
	});
});
