import { expect } from "chai";
import { proxyGet } from "../proxy-get";
import { CONSTANTS } from "../../../../constants";
import { assertValidVerificationProperty } from "../../assertions";
import { extractVerificationPropValues } from "../../properties";

// Mock the assertValidVerificationProperty and extractVerificationPropValues functions
import sinon from "sinon";

describe("proxyGet", function() 
{
	it("should return true for verification check properties", function() 
	{
		const prop = `${CONSTANTS.FROST.CHECK_PROP_PREFIX}123__propName`;
		const verificationValue = "123";
		const target = {
			[CONSTANTS.FROST.BASIS_SYMBOL]: verificationValue,
		};

		// Create stubs for the external functions
		const extractStub = sinon.stub().returns({
			verificationValue,
			propertyName: "propName", 
		});
		const assertStub = sinon.stub().returns(true);

		// Replace the actual functions with the stubs
		const originalExtract = extractVerificationPropValues;
		const originalAssert = assertValidVerificationProperty;
		(global as any).extractVerificationPropValues = extractStub;
		(global as any).assertValidVerificationProperty = assertStub;

		const result = proxyGet({}, target, prop, {
			guid: "123",
			recursor: () => {},
		});
		expect(result).to.be.true;

		// Restore the original functions
		(global as any).extractVerificationPropValues = originalExtract;
		(global as any).assertValidVerificationProperty = originalAssert;
	});

	it("should return true for IS_FROSTY", function() 
	{
		const target = {};
		const prop = CONSTANTS.FROST.IS_FROSTY;
		const result = proxyGet({}, target, prop, {
			guid: "123",
			recursor: () => {},
		});
		expect(result).to.be.true;
	});

	it("should return the target property for other properties", function() 
	{
		const target = {
			key: "value", 
		};
		const prop = "key";
		const result = proxyGet({}, target, prop, {
			guid: "123",
			recursor: () => {},
		});
		expect(result).to.equal("value");
	});
});
