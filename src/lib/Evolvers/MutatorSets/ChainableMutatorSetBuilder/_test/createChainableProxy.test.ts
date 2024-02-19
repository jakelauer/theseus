import { expect } from "chai";
import sinon from "sinon";

import { createChainingProxy } from "../operations/createChainingProxy";

describe("createChainingProxy", function () {
    let target: any;
    let queueMutatorExecution: sinon.SinonStub;
    let isAsyncEncountered: sinon.SinonStub;
    let getFinalForm: sinon.SinonStub;

    beforeEach(function () {
        target = {
            syncMethod: () => "syncResult",
            asyncMethod: async () => "asyncResult",
        };
        queueMutatorExecution = sinon.stub().callsFake((_, func, args) => func(...args));
        isAsyncEncountered = sinon.stub().returns(false);
        getFinalForm = sinon.stub().returns({});
    });

    it("should return a proxy that intercepts property accesses", function () {
        const proxy = createChainingProxy({
            target,
            queueMutation: queueMutatorExecution,
        });
        expect(proxy.syncMethod).to.be.a("function");
        expect(proxy.asyncMethod).to.be.a("function");
    });

    it("should queue function execution and allow chaining with 'then' before any async operation", function () {
        const proxy = createChainingProxy({
            target,
            queueMutation: queueMutatorExecution,
        });
        const result = proxy.syncMethod();
        expect(queueMutatorExecution.calledOnce).to.be.true;
        expect(result.then).not.to.be.undefined;
    });
});
