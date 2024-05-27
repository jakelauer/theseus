import { expect } from "chai";

import { capitalizeFirstLetter } from "../capitalizeFirstLetter"; // Adjust the import path as necessary

describe("capitalizeFirstLetter", function () 
{
	it("should capitalize the first letter of a string", function () 
	{
		expect(capitalizeFirstLetter("example")).to.equal("Example");
	});

	it("should return the original string if the first character is not a letter", function () 
	{
		expect(capitalizeFirstLetter("1example")).to.equal("1example");
	});

	it("should handle empty strings without error", function () 
	{
		expect(capitalizeFirstLetter("")).to.equal("");
	});
});
