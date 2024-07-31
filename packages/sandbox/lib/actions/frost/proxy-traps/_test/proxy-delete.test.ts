// Mock the assertValidVerificationProperty and extractVerificationPropValues functions
import {
	expect, describe, it, vi, 
} from "vitest";
import { CONSTANTS } from "sandbox-constants";
import { proxyDelete } from "../proxy-delete.js";
import { generateVerificationProperty } from "../../properties.js";

describe("proxyDelete", function () 
{
	it("should delete the verification property", function () 
	{
		const target = {
			[CONSTANTS.FROST.BASIS_SYMBOL]: "123",
		};

		proxyDelete(target, CONSTANTS.FROST.BASIS_SYMBOL, {
			proxy: target,
		});
		expect(target[CONSTANTS.FROST.BASIS_SYMBOL]).to.be.undefined;
	});

	it("should delete the sandbox property with valid verification", function () 
	{
		const target = {
			key: "value",
			[CONSTANTS.FROST.BASIS_SYMBOL]: "123",
		};
		const ostensibleProp = generateVerificationProperty(target, "key");

		const propValues = {
			verificationValue: "123",
			propertyName: "key",
		};

		const propertyStub = vi.fn().mockReturnValue(true);
		const extractStub = vi.fn().mockReturnValue(propValues);
		const assertStub = vi.fn().mockReturnValue(true);

		(global as any).propertyStartsWith = propertyStub;
		(global as any).extractVerificationPropValues = extractStub;
		(global as any).assertValidVerificationProperty = assertStub;

		expect(() =>
			proxyDelete(target, ostensibleProp, {
				proxy: target,
			}),
		).not.to.throw();
		expect(target.key).to.be.undefined;

		// Restore the original functions
		vi.restoreAllMocks();
	});

	it("should throw an error for other properties", function () 
	{
		const target = {
			key: "value",
		};
		const ostensibleProp = "key";

		expect(() =>
			proxyDelete(target, ostensibleProp, {
				proxy: target,
			}),
		).to.throw('Cannot modify property "key" of the original object.');
	});
});
