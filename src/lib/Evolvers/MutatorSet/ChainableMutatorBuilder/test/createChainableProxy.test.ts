import { expect } from "chai";
import sinon from "sinon";

import { createChainableProxy } from "../createChainableProxy";

describe("createChainableProxy", function () {
    let target: any;
    let queueMutatorExecution: sinon.SinonStub;
    let isAsyncEncountered: sinon.SinonStub;
    let setFinallyMode: sinon.SinonStub;
    let getFinallyMode: sinon.SinonStub;
    let getFinalForm: sinon.SinonStub;

    beforeEach(function () {
        target = {
            syncMethod: () => "syncResult",
            asyncMethod: async () => "asyncResult",
        };
        queueMutatorExecution = sinon.stub().callsFake((_, func, args) => func(...args));
        isAsyncEncountered = sinon.stub().returns(false);
        setFinallyMode = sinon.stub();
        getFinallyMode = sinon.stub().returns(false);
        getFinalForm = sinon.stub().returns({});
    });

    it("should return a proxy that intercepts property accesses", function () {
        const proxy = createChainableProxy({
            target,
            queueMutatorExecution,
            setFinallyMode,
            getFinallyMode,
        });
        expect(proxy.syncMethod).to.be.a("function");
        expect(proxy.asyncMethod).to.be.a("function");
    });

    it("should queue function execution and allow chaining with 'then' before any async operation", function () {
        const proxy = createChainableProxy({
            target,
            queueMutatorExecution,
            setFinallyMode,
            getFinallyMode,
        });
        const result = proxy.syncMethod();
        expect(queueMutatorExecution.calledOnce).to.be.true;
        expect(result.then).not.to.be.undefined;
    });

    it("should handle .finally access by setting finally mode", function () {
        const proxy = createChainableProxy({
            target,
            queueMutatorExecution,
            setFinallyMode,
            getFinallyMode,
        });
        proxy.finally;
        expect(setFinallyMode.calledOnceWith(true)).to.be.true;
    });

    it("should return direct result in finally mode", function () {
        getFinallyMode.returns(true); // Simulate finally mode being active
        const proxy = createChainableProxy({
            target,
            queueMutatorExecution,
            setFinallyMode,
            getFinallyMode,
        });
        const result = proxy.syncMethod();
        expect(result).to.equal("syncResult");
    });
});
