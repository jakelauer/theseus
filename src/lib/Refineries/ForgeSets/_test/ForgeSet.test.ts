import { expect } from "chai";

import { ForgeSet } from "../ForgeSet.js";

describe("ForgeSet", function () 
{
	it("createForgeSet", function () 
	{
		const forgeSet = ForgeSet.create({}, "test", {
			foo: () => {},
			bar: () => {},
		});

		expect(forgeSet).to.have.property("foo");
		expect(forgeSet).to.have.property("bar");
	});
});
