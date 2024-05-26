import { expect } from "chai";

import { makeImmutable } from "../makeImmutable"; // Adjust the import path as necessary

describe("makeImmutable", function () 
{
	it("should prevent modifications to the returned string/object", function () 
	{
		const immutableString = makeImmutable("test");
		expect(immutableString).to.equal("immutableTest");
	});
});
