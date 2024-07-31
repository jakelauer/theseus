import { proxyGet } from "../proxy-get.js";
import {
	expect, describe, it, vi,
} from "vitest";
import { CONSTANTS } from "sandbox-constants";
import { assertValidVerificationProperty } from "../../assertions.js";
import { extractVerificationPropValues } from "../../properties.js";

// Mock the assertValidVerificationProperty and extractVerificationPropValues functions
vi.mock("../../assertions.js");
vi.mock("../../properties.js");

describe("proxyGet", function () 
{
	it("should return true for verification check properties", function () 
	{
		const prop = `${CONSTANTS.FROST.CHECK_PROP_PREFIX}123__propName`;
		const verificationValue = "123";
		const target = {
			[CONSTANTS.FROST.BASIS_SYMBOL]: verificationValue,
		};

		// Create mocks for the external functions
		vi.mocked(extractVerificationPropValues).mockReturnValue({
			verificationValue,
			propertyName: "propName",
		});
		vi.mocked(assertValidVerificationProperty).mockReturnValue(true);

		const result = proxyGet({}, target, prop, {
			guid: "123",
			recursor: () => {},
		});
		expect(result).to.be.true;

		// Verify that the mocked functions were called
		expect(extractVerificationPropValues).toHaveBeenCalled();
		expect(assertValidVerificationProperty).toHaveBeenCalled();
	});

	it("should return true for IS_FROSTY", function () 
	{
		const target = {};
		const prop = CONSTANTS.FROST.IS_FROSTY;
		const result = proxyGet({}, target, prop, {
			guid: "123",
			recursor: () => {},
		});
		expect(result).to.be.true;
	});

	it("should return the target property for other properties", function () 
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
