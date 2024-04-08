import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

import { ChainableMutatorQueue } from "../ChainableMutatorQueue";

import type { MutableData, Mutator } from "@Evolvers/Types/MutatorTypes";
import type { Mutable } from "@Shared/String/makeMutable";

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
        const argName = "mutableTestArg" as Mutable<"testArg">;
        let testData: MutableData<{ value: number }, "mutableTestArg"> = { [argName]: { value: 1 } };
        type TMutableData = typeof testData;
        type TEvolverData = (typeof testData)[typeof argName];

        const setMutableData = (data: any) => 
        {
            testData = data;
        };
        const getMutableData = () => testData;
        const syncMutator: Mutator<any, any, TEvolverData> = (
            { mutableTestArg }: TMutableData,
            increment: number,
        ) => 
        {
            mutableTestArg.value += increment;

            return mutableTestArg;
        };

        const queue = ChainableMutatorQueue.create({
            argName,
            getMutableData,
            setMutableData,
        });

        void queue.queueMutation("syncMutatorPath", syncMutator, [1]);
        void queue.queueMutation("syncMutatorPath", syncMutator, [2]);

        expect(testData[argName]).to.deep.equal({ value: 4 });
    });

    it("should handle asynchronous mutators correctly", async function () 
    {
        const argName = "mutableTestArg" as Mutable<"testArg">;
        let testData: MutableData<{ value: number }, "mutableTestArg"> = { [argName]: { value: 1 } };
        type TMutableData = typeof testData;
        type TEvolverData = (typeof testData)[typeof argName];

        const setMutableData = (data: any) => 
        {
            testData = data;
        };

        const getMutableData = () => testData;
        const asyncMutator: Mutator<any, any, Promise<TEvolverData>> = async (
            { mutableTestArg }: TMutableData,
            increment: number,
        ) => 
        {
            return new Promise((resolve) => 
            {
                mutableTestArg.value += increment;
                setTimeout(() => resolve(mutableTestArg), 50);
            });
        };

        const queue = ChainableMutatorQueue.create({
            argName,
            getMutableData,
            setMutableData,
        });

        await queue.queueMutation("asyncMutatorPath", asyncMutator, [1]);
        await queue.queueMutation("asyncMutatorPath", asyncMutator, [2]);

        expect(testData[argName]).to.deep.equal({ value: 4 });
    });

    it("should log an error if a mutator returns undefined", function () 
    {
        const argName = "undefinedReturnArg" as Mutable<string>;
        const setMutableData = sinon.stub();
        const getMutableData = sinon.stub().returns({ [argName]: { value: 0 } });
        const undefinedMutator = () => undefined;

        const queue = ChainableMutatorQueue.create({
            argName,
            getMutableData,
            setMutableData,
        });

        expect(() => queue.queueMutation("undefinedMutatorPath", undefinedMutator as any, [])).to.throw(
            "Mutator undefinedMutatorPath returned undefined. Mutators must return a value compatible with the mutable data type.",
        );
    });

    it("should log an error if a mutator returns the wrong type", function () 
    {
        const argName = "undefinedReturnArg" as Mutable<string>;
        const setMutableData = sinon.stub();
        const getMutableData = sinon.stub().returns({ [argName]: { value: 0 } });
        const stringMutator = () => "not an object" as any;

        const queue = ChainableMutatorQueue.create({
            argName,
            getMutableData,
            setMutableData,
        });

        expect(() => queue.queueMutation("numberToStringMutatorPath", stringMutator, [])).to.throw(
            "Expected mutator numberToStringMutatorPath to return an object, but got type \"string\" from value \"not an object\".",
        );
    });

    it("should log an error if a mutator returns the wrong type async", async function () 
    {
		type Data = {"mutableUndefinedReturn": number};
		const argName = "mutableUndefinedReturn" as Mutable<"undefinedReturn">;
		const setMutableData = sinon.stub();
		const getMutableData = sinon.stub().returns({ [argName]: 0 });
		const numberToStringMutator = async () => 
		{
		    return Promise.resolve("not a number") as unknown as Data;
		};

		const queue = ChainableMutatorQueue.create<Data, typeof argName>({
		    argName,
		    getMutableData,
		    setMutableData,
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
