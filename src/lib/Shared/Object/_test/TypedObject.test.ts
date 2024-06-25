import { expect } from "chai";
import { describe, it } from "mocha";
import TypedObject from "../TypedObject";

describe("TypedObject", () => 
{
	it("Ensures .keys matches default Object.keys", () => 
	{
		const baseObj = {
			1: 2,
			3: 4,
			5: 6, 
		};

		expect(Object.keys(baseObj)).to.deep.equal(TypedObject.keys(baseObj));
	});
});
