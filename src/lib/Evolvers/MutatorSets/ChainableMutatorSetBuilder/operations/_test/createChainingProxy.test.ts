import { expect } from "chai";

import { createChainingProxy } from "../createChainingProxy";

describe("createChainingProxy", function () {
    it("should allow method chaining and return proxy for chainable methods", function () {
        const target = {
            chainableMethod: () => {},
        };
        const proxy = createChainingProxy({
            target,
            queueMutation: () => {},
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
            queueMutation: () => {},
        });

        expect(proxy.someProperty).to.equal("value");
    });

    it("should throw an error when accessing undefined properties", function () {
        const target = {};
        const proxy = createChainingProxy({
            target,
            queueMutation: () => {},
        });

        expect(() => (proxy as any).undefinedProperty).to.throw(
            Error,
            'Property "undefinedProperty" not found in target',
        );
    });
});
