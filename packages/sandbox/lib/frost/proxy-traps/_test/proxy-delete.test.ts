import { expect } from "chai";

// Mock the assertValidVerificationProperty and extractVerificationPropValues functions
import sinon from "sinon";
import { CONSTANTS } from "../../../constants";
import { proxyDelete } from "../proxy-delete";
import { extractVerificationPropValues, generateVerificationProperty, propertyStartsWith } from "../../properties";
import { assertValidVerificationProperty } from "../../assertions";

describe("proxyDelete", function() 
{
	it("should delete the verification property", function() 
	{
		const target = { [CONSTANTS.VERIFICATION.BASIS_SYMBOL]: "123" };

		proxyDelete(target, CONSTANTS.VERIFICATION.BASIS_SYMBOL);
		expect(target[CONSTANTS.VERIFICATION.BASIS_SYMBOL]).to.be.undefined;
	});

	it("should delete the sandbox property with valid verification", function() 
	{
		const target = { key: "value", [CONSTANTS.VERIFICATION.BASIS_SYMBOL]: "123" };
		const ostensibleProp = generateVerificationProperty(target, "key");

		const propValues = { verificationValue: "123", propertyName: "key" };

		// Directly stub the functions without using withArgs
		const propertyStub = sinon.stub().returns(true);
		const extractStub = sinon.stub().returns(propValues);
		const assertStub = sinon.stub().returns(true);

		// Replace the actual functions with the stubs
		const originalPropertyStartsWith = propertyStartsWith;
		const originalExtractVerificationPropValues = extractVerificationPropValues;
		const originalAssertValidVerificationProperty = assertValidVerificationProperty;
		(global as any).propertyStartsWith = propertyStub;
		(global as any).extractVerificationPropValues = extractStub;
		(global as any).assertValidVerificationProperty = assertStub;
	
		expect(() => proxyDelete(target, ostensibleProp)).not.to.throw();
		expect(target.key).to.be.undefined;
	
		// Restore the original functions
		(global as any).propertyStartsWith = originalPropertyStartsWith;
		(global as any).extractVerificationPropValues = originalExtractVerificationPropValues;
		(global as any).assertValidVerificationProperty = originalAssertValidVerificationProperty;
	});

	it("should throw an error for other properties", function() 
	{
		const target = { key: "value" };
		const ostensibleProp = "key";

		expect(() => proxyDelete(target, ostensibleProp)).to.throw("Cannot modify property \"key\" of the original object.");
	});
});
