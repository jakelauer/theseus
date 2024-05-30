import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

import { ChainableMutatorQueue } from "../ChainableMutatorQueue";

import type { ParamNameData, Mutator } from "@Evolvers/Types/MutatorTypes";

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
		const argName = "testArg";
		let testData: ParamNameData<{ value: number }, "testArg"> = { [argName]: { value: 1 } };
        type TData = typeof testData;
        type TEvolverData = (typeof testData)[typeof argName];

        const setData = (data: any) => 
        {
        	testData = data;
        };
        const getData = () => testData;
        const syncMutator: Mutator<any, any, TEvolverData> = (
        	{ testArg }: TData,
        	increment: number,
        ) => 
        {
        	testArg.value += increment;

        	return testArg;
        };

        const queue = ChainableMutatorQueue.create({
        	argName,
        	getData: getData,
        	setData: setData,
        });

        void queue.queueMutation("syncMutatorPath", syncMutator, [1]);
        void queue.queueMutation("syncMutatorPath", syncMutator, [2]);

        expect(testData[argName]).to.deep.equal({ value: 4 });
	});

	it("should handle asynchronous mutators correctly", async function () 
	{
		const argName = "testArg";
		let testData: ParamNameData<{ value: number }, "testArg"> = { [argName]: { value: 1 } };
        type TData = typeof testData;
        type TEvolverData = (typeof testData)[typeof argName];

        const setData = (data: any) => 
        {
        	testData = data;
        };

        const getData = () => testData;
        const asyncMutator: Mutator<any, any, Promise<TEvolverData>> = async (
        	{ testArg }: TData,
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
        	argName,
        	getData: getData,
        	setData: setData,
        });

        await queue.queueMutation("asyncMutatorPath", asyncMutator, [1]);
        await queue.queueMutation("asyncMutatorPath", asyncMutator, [2]);

        expect(testData[argName]).to.deep.equal({ value: 4 });
	});

	it("should log an error if a mutator returns undefined", function () 
	{
		const argName = "undefinedReturnArg" as string;
		const setData = sinon.stub();
		const getData = sinon.stub().returns({ [argName]: { value: 0 } });
		const undefinedMutator = () => undefined;

		const queue = ChainableMutatorQueue.create({
			argName,
			getData: getData,
			setData: setData,
		});

		expect(() => queue.queueMutation("undefinedMutatorPath", undefinedMutator as any, [])).to.throw(
			"Mutator undefinedMutatorPath returned undefined. Mutators must return a value compatible with the data type.",
		);
	});

	it("should log an error if a mutator returns the wrong type", function () 
	{
		const argName = "undefinedReturnArg" as string;
		const setData = sinon.stub();
		const getData = sinon.stub().returns({ [argName]: { value: 0 } });
		const stringMutator = () => "not an object" as any;

		const queue = ChainableMutatorQueue.create({
			argName,
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
		const argName = "undefinedReturn";
		const setData = sinon.stub();
		const getData = sinon.stub().returns({ [argName]: 0 });
		const numberToStringMutator = async () => 
		{
		    return Promise.resolve("not a number") as unknown as Data;
		};

		const queue = ChainableMutatorQueue.create<Data, typeof argName>({
		    argName,
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
