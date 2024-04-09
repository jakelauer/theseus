import { expect } from "chai";
import { beforeEach, describe, it } from "mocha";
import sinon from "sinon";

import { BroadcasterObserver } from "@Broadcast/BroadcasterObserver";

describe("BroadcasterObserver", () => 
{
    let observer: BroadcasterObserver<any>;
    let callback: sinon.SinonSpy;

    beforeEach(() => 
    {
        callback = sinon.spy();
        observer = new BroadcasterObserver<any>(callback);
    });

    it("initializes with a callback function", () => 
    {
        // Ensure the observer is instantiated with the callback
        expect(observer).to.be.an.instanceOf(BroadcasterObserver);
        expect(callback.called).to.be.false; // Callback should not be called on instantiation
    });

    it("calls the callback with provided data asynchronously", async () => 
    {
        const testData = { key: "value" };
        await observer.update(testData);

        sinon.assert.calledOnce(callback);
        sinon.assert.calledWith(callback, testData);

        // To validate asynchronous execution, you might check for behavior that can only result 
        // from asynchronous execution. This might involve checking states before and after promises 
        // resolve in real application scenarios.
    });

    it("rejects the promise if the callback throws an error", async () => 
    {
        const errorMessage = "Callback error";
        const errorThrowingObserver = new BroadcasterObserver<any>(() => 
        {
            throw new Error(errorMessage);
        });

        try 
        {
            await errorThrowingObserver.update({});
            // If the update does not throw, force the test to fail
            expect.fail("Expected update to throw an error.");
        }
        catch (error) 
        {
            expect(error).to.be.an("error");
            expect(error.message).to.equal(errorMessage);
        }
    });
});
