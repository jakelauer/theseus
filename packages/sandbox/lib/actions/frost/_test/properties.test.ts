import { expect } from "chai";
import { extractVerificationPropValues, propertyStartsWith } from "../properties.js";

describe("propertyStartsWith", function () 
{
	it("should return true if the string property starts with the search string", function () 
	{
		const prop = "testProperty";
		const searchString = "test";
		expect(propertyStartsWith(prop, searchString)).to.be.true;
	});

	it("should return false if the string property does not start with the search string", function () 
	{
		const prop = "testProperty";
		const searchString = "wrong";
		expect(propertyStartsWith(prop, searchString)).to.be.false;
	});

	it("should return true if the symbol property starts with the search string", function () 
	{
		const prop = Symbol("testProperty");
		const searchString = "test";
		expect(propertyStartsWith(prop, searchString)).to.be.true;
	});

	it("should return false if the symbol property does not start with the search string", function () 
	{
		const prop = Symbol("testProperty");
		const searchString = "wrong";
		expect(propertyStartsWith(prop, searchString)).to.be.false;
	});

	it("should return false if the symbol property has no description", function () 
	{
		const prop = Symbol();
		const searchString = "test";
		expect(propertyStartsWith(prop, searchString)).to.be.false;
	});

	it("should extract verification values from a valid input string", function () 
	{
		const input = "__verify_123__propName";
		const result = extractVerificationPropValues(input);
		expect(result).to.deep.equal({
			verificationValue: "123",
			propertyName: "propName",
		});
	});

	it("should return undefined if the input string does not match the pattern", function () 
	{
		const input = "invalidString";
		const result = extractVerificationPropValues(input);
		expect(result).to.be.undefined;
	});
});
