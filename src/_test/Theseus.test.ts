import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { beforeEach, describe, it } from "mocha";
import sinon from "sinon";

import { Theseus } from "@/Theseus";

chai.use(chaiAsPromised);

describe("Observation", () => 
{
	let observation: Theseus<{ test: string }>;

	beforeEach(() => 
	{
		observation = new Theseus<{ test: string }>({ test: "initial" });
	});

	it("should initialize with provided initial data", () => 
	{
		// JSON.stringify ignores symbols, which helpfully avoids sandbox symbols
		expect(JSON.stringify(observation.state)).to.equal(JSON.stringify({ test: "initial" }));
	});

	it("should allow observers to subscribe and receive updates", async () => 
	{
		const callback = sinon.fake();
		observation.observe(callback);

		await observation["update"]({ test: "updated" });
		expect(callback.calledWith({ test: "updated" })).to.be.true;

		return;
	});

	it("should allow observers to subscribe and receive initial state immediately if requested", async () => 
	{
		const callback = sinon.fake();
		observation.observe(callback, true);

		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(callback.calledOnce).to.be.true;
		expect(callback.calledWith({ test: "initial" })).to.be.true;

		return;
	});

	it("should not call observers immediately if updateImmediately is false", () => 
	{
		const callback = sinon.fake();
		observation.observe(callback, false);

		expect(callback.called).to.be.false;
	});

	it("should correctly update the state and notify observers", async () => 
	{
		const callback = sinon.fake();
		observation.observe(callback);

		await observation["update"]({ test: "new value" });
		expect(observation.state).to.deep.equal({ test: "new value" });
		expect(callback.calledWith({ test: "new value" })).to.be.true;

		return;
	});

	it("should correctly handle instance retrieval and updates by ID", async () => 
	{
		const id = observation.__uuid;
		const callback = sinon.fake();
		observation.observe(callback);

		await Theseus.updateInstance(id, { test: "static update" });

		// Since updateInstance is async, we may need to wait or use fake timers
		// This example assumes immediate update for simplicity
		expect(callback.calledWith({ test: "static update" })).to.be.true;

		return;
	});
});
