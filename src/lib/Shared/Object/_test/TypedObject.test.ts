import TypedObject from "../TypedObject.js";

import {
	describe, expect, it, 
} from "vitest";

describe("TypedObject",
	() => 
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
