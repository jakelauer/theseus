import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';

import { buildChainableMutatorQueue } from '../buildChainableMutatorQueue';

import type { MutableData, Mutator } from "@Evolvers/Types/MutatorTypes";
import type { Mutable } from "@Shared/String/makeMutable";

chai.use(chaiAsPromised);

describe("buildChainableMutatorQueue", function () {
    let sandbox: sinon.SinonSandbox;

    beforeEach(function () {
        sandbox = sinon.createSandbox();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("should process synchronous mutators in sequence", function () {
        const argName = "mutableTestArg" as Mutable<`testArg`>;
        let testData: MutableData<{ value: number }, "mutableTestArg"> = { [argName]: { value: 1 } };
        type TMutableData = typeof testData;
        type TEvolverData = (typeof testData)[typeof argName];

        const setMutableData = (data: any) => {
            testData = data;
        };
        const getMutableData = () => testData;
        const syncMutator: Mutator<any, any, TEvolverData> = (
            { mutableTestArg }: TMutableData,
            increment: number,
        ) => {
            mutableTestArg.value += increment;

            return mutableTestArg;
        };

        const queueMutation = buildChainableMutatorQueue({
            argName,
            getMutableData,
            setMutableData,
        });

        queueMutation("syncMutatorPath", syncMutator, [1]);
        queueMutation("syncMutatorPath", syncMutator, [2]);

        expect(testData[argName]).to.deep.equal({ value: 4 });
    });

    it("should handle asynchronous mutators correctly", async function () {
        const argName = "mutableTestArg" as Mutable<`testArg`>;
        let testData: MutableData<{ value: number }, "mutableTestArg"> = { [argName]: { value: 1 } };
        type TMutableData = typeof testData;
        type TEvolverData = (typeof testData)[typeof argName];

        const setMutableData = (data: any) => {
            testData = data;
        };

        const getMutableData = () => testData;
        const asyncMutator: Mutator<any, any, Promise<TEvolverData>> = async (
            { mutableTestArg }: TMutableData,
            increment: number,
        ) => {
            return new Promise((resolve) => {
                mutableTestArg.value += increment;
                setTimeout(() => resolve(mutableTestArg), 50);
            });
        };

        const queueMutation = buildChainableMutatorQueue({
            argName,
            getMutableData,
            setMutableData,
        });

        await queueMutation("asyncMutatorPath", asyncMutator, [1]);
        await queueMutation("asyncMutatorPath", asyncMutator, [2]);

        expect(testData[argName]).to.deep.equal({ value: 4 });
    });

    it("should log an error if a mutator returns undefined", function () {
        const argName = "undefinedReturnArg" as Mutable<string>;
        const setMutableData = sinon.stub();
        const getMutableData = sinon.stub().returns({ [argName]: { value: 0 } });
        const undefinedMutator = () => undefined;

        const queueMutation = buildChainableMutatorQueue({
            argName,
            getMutableData,
            setMutableData,
        });

        expect(() => queueMutation("undefinedMutatorPath", undefinedMutator as any, [])).to.throw(
            `Mutator undefinedMutatorPath returned undefined. Mutators must return a value compatible with the mutable data type.`,
        );
    });

    it("should log an error if a mutator returns the wrong type", function () {
        const argName = "undefinedReturnArg" as Mutable<string>;
        const setMutableData = sinon.stub();
        const getMutableData = sinon.stub().returns({ [argName]: { value: 0 } });
        const stringMutator = () => "not an object" as any;

        const queueMutation = buildChainableMutatorQueue({
            argName,
            getMutableData,
            setMutableData,
        });

        expect(() => queueMutation("numberToStringMutatorPath", stringMutator, [])).to.throw(
            `Expected mutator numberToStringMutatorPath to return an object, but got type "string" from value "not an object".`,
        );
    });

    it("should log an error if a mutator returns the wrong type async", async function () {
        const argName = "undefinedReturnArg" as Mutable<string>;
        const setMutableData = sinon.stub();
        const getMutableData = sinon.stub().returns({ [argName]: 0 });
        const numberToStringMutator = () => Promise.resolve("not a number");

        const queueMutation = buildChainableMutatorQueue({
            argName,
            getMutableData,
            setMutableData,
        });

        try {
            await queueMutation("numberToStringMutatorPath", numberToStringMutator, []);

            expect.fail("Expected an error to be thrown");
        } catch (e) {
            expect(e.message).to.equal(
                `Expected mutator numberToStringMutatorPath to return an object, but got type "string" from value "not a number".`,
            );
        }

        return;
    });
});
