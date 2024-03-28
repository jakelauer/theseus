import { expect } from "chai";

import { createChainingProxy } from "../createChainingProxy";

describe("createChainingProxy", function () {
    it("should allow method chaining and return proxy for chainable methods", function () {
        const target = {
            chainableMethod: () => {},
        };
        const proxy = createChainingProxy({
            target,
            queueMutation: () => ({}),
        });

        expect(proxy.chainableMethod()).to.equal(proxy);
    });

    it("should handle end of chain indicators correctly", function () {
        let finalChainLinkReached = false;
        const target = {
            finalForm: () => {
                finalChainLinkReached = true;
            },
        };
        const proxy = createChainingProxy({
            target,
            queueMutation: (selfPath, func, args) => {
                if (selfPath === "finalForm") {
                    func.apply(target, args);
                }
                return {};
            },
        });

        proxy.finalForm();
        expect(finalChainLinkReached).to.be.true;
    });

    it("should queue functions correctly via queueMutation", function () {
        let queuedFunctionCalled = false;
        const target = {
            toBeQueued: () => {
                queuedFunctionCalled = true;
            },
        };
        const proxy = createChainingProxy({
            target,
            queueMutation: (selfPath, func, args) => {
                if (selfPath === "toBeQueued") {
                    func.apply(target, args);
                }
                return {};
            },
        });

        proxy.toBeQueued();
        expect(queuedFunctionCalled).to.be.true;
    });

    it("should return correct values for non-function properties", function () {
        const target = {
            someProperty: "value",
        };
        const proxy = createChainingProxy({
            target,
            queueMutation: () => ({}),
        });

        expect(proxy.someProperty).to.equal("value");
    });

    it("should throw an error when accessing undefined properties", function () {
        const target = {};
        const proxy = createChainingProxy({
            target,
            queueMutation: () => ({}),
        });

        expect(() => (proxy as any).undefinedProperty).to.throw(
            Error,
            'Property "undefinedProperty" not found in target',
        );
    });

    it("should correctly handle exceptions thrown in queued functions", function () {
        const errorMessage = "Error in queued function";
        const target = {
            throwError: () => {
                throw new Error(errorMessage);
            },
        };
        const proxy = createChainingProxy({
            target,
            queueMutation: (selfPath, func, args) => {
                return func.apply(target, args);
            },
        });

        expect(() => proxy.throwError()).to.throw(Error, errorMessage);
    });

    it("should maintain the order of queued mutations", function () {
        const order: number[] = [];
        const target = {
            first: () => {
                order.push(1);
            },
            second: () => {
                order.push(2);
            },
        };
        const proxy = createChainingProxy({
            target,
            queueMutation: (selfPath, func) => {
                return func();
            },
        });

        proxy.first().second();
        expect(order).to.deep.equal([1, 2]);
    });

    it("should return correct result from a queued function not meant for further chaining", function () {
        const expectedResult = 42;
        const target = {
            calculate: () => expectedResult,
        };
        const proxy = createChainingProxy({
            target,
            queueMutation: (selfPath, func) => func(),
        });

        const result = proxy.finally.calculate();
        expect(result).to.equal(expectedResult);
    });

    it("should handle asynchronous method calls correctly", async function () {
        let asyncOperationCompleted = false;
        const target = {
            asyncMethod: () =>
                new Promise((resolve) =>
                    setTimeout(() => {
                        asyncOperationCompleted = true;
                        resolve(true);
                    }, 10),
                ),
        };
        const proxy = createChainingProxy({
            target,
            queueMutation: (selfPath, func) => func(),
        });

        await proxy.finally.asyncMethod();
        expect(asyncOperationCompleted).to.be.true;
    });
});
