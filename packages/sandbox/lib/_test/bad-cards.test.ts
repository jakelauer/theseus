import { GetMockGameItem } from "./bad-cards.test-dep";
import { sandbox } from "../actions/sandbox";
import { expect } from "chai";
import { cement } from "../actions/cement/cement";
import { defrost, frost } from "../actions/frost";
import { isFrost } from "../actions/frost/detect/is-frost-proxy";
import { isSandbox } from "../actions/sandbox";

describe("Bad Cards", function()
{
	it("should successfully sandbox a game item", function()
	{
		const gameItem = GetMockGameItem();

		const sandboxedGameItem = sandbox(gameItem);
		sandboxedGameItem.id = "fake-new-id";

		expect(sandboxedGameItem).not.to.deep.equal(gameItem);
		expect(gameItem.id).not.to.equal("fake-new-id");

		expect(isFrost(gameItem, "every")).to.be.false;
		expect(isSandbox(gameItem, "every")).to.be.false;
		expect(isFrost(sandboxedGameItem, "every")).to.be.false;
		expect(isSandbox(sandboxedGameItem)).to.be.true;
	});

	it("should successfully cement a sandboxed game item", function()
	{
		const gameItem = GetMockGameItem();

		const sandboxedGameItem = sandbox(gameItem);
		sandboxedGameItem.id = "fake-new-id";

		const cementedGameItem = cement(sandboxedGameItem);

		expect(cementedGameItem).to.equal(gameItem);
		expect(gameItem.id).to.equal("fake-new-id");

		expect(isFrost(gameItem)).to.be.false;
		expect(isSandbox(gameItem)).to.be.false;
		expect(isFrost(sandboxedGameItem)).to.be.false;
		expect(isSandbox(sandboxedGameItem)).to.be.true;
		expect(isFrost(cementedGameItem)).to.be.false;
		expect(isSandbox(cementedGameItem)).to.be.false;
	});

	it("should successfully frost and defrost a sandboxed game item", function()
	{
		const gameItem = GetMockGameItem();

		const frozenGameItem = frost(gameItem);
		const sandboxedFrozenGameItem = sandbox(frozenGameItem);

		expect(isFrost(frozenGameItem)).to.be.true;
		expect(() => {(frozenGameItem as any).id = "fake-new-id";}).to.throw();
		expect(() => {(sandboxedFrozenGameItem as any).id = "fake-new-id";}).not.to.throw();
		expect(sandboxedFrozenGameItem.id).to.equal("fake-new-id");
		expect(frozenGameItem.id).not.to.equal("fake-new-id");
		expect(gameItem.id).not.to.equal("fake-new-id");

		const cementedFrozenGameItem = cement(sandboxedFrozenGameItem);
		expect(cementedFrozenGameItem).to.equal(frozenGameItem);

		expect(cementedFrozenGameItem.id).to.equal("fake-new-id");
		expect(frozenGameItem.id).to.equal("fake-new-id");
		expect(gameItem.id).to.equal("fake-new-id");

		expect(() => {(cementedFrozenGameItem as any).id = "second-fake-id";}).to.throw();

		const unfrosted = defrost(cementedFrozenGameItem);
		expect(unfrosted).to.equal(gameItem);
		expect(() => {(unfrosted as any).id = "third-fake-id";}).not.to.throw();
	});
});
