import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { beforeEach, describe, it } from 'mocha';
import sinon from 'sinon';

import { Observation } from '@Observe/Observation';

chai.use(chaiAsPromised);

describe("Observation", () => {
    let observation: Observation<{ test: string }>;

    beforeEach(() => {
        observation = new Observation<{ test: string }>({ initialData: { test: "initial" } });
    });

    it("should initialize with provided initial data", () => {
        expect(observation.state).to.deep.equal({ test: "initial" });
    });

    it("should allow observers to subscribe and receive updates", async () => {
        const callback = sinon.fake();
        observation.observe(callback);

        await observation["update"]({ test: "updated" });
        expect(callback.calledWith({ test: "updated" })).to.be.true;

        return;
    });

    it("should allow observers to subscribe and receive initial state immediately if requested", async () => {
        const callback = sinon.fake();
        observation.observe(callback, true);

        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(callback.calledOnce).to.be.true;
        expect(callback.calledWith({ test: "initial" })).to.be.true;

        return;
    });

    it("should not call observers immediately if updateImmediately is false", () => {
        const callback = sinon.fake();
        observation.observe(callback, false);

        expect(callback.called).to.be.false;
    });

    it("should correctly update the state and notify observers", async () => {
        const callback = sinon.fake();
        observation.observe(callback);

        await observation["update"]({ test: "new value" });
        expect(observation.state).to.deep.equal({ test: "new value" });
        expect(callback.calledWith({ test: "new value" })).to.be.true;

        return;
    });

    it(`should correctly handle instance retrieval and updates by ID`, async () => {
        console.log("observation.__uuid", observation.__uuid);
        const id = observation.__uuid;
        const callback = sinon.fake();
        observation.observe(callback);

        console.log("Starting update for uuid", id);
        await Observation.updateInstance(id, { test: "static update" });
        console.log("Finished update for uuid", id);

        // Since updateInstance is async, we may need to wait or use fake timers
        // This example assumes immediate update for simplicity
        expect(callback.calledWith({ test: "static update" })).to.be.true;

        return;
    });
});
