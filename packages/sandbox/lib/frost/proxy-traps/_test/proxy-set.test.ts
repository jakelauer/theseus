import { expect } from "chai";

// Mock the assertValidVerificationProperty function
import { SANDBOX_VERIFIABLE_PROP_SYMBOL, CONSTANTS } from "../../../constants";
import { proxySet } from "../proxy-set";
import type { SandboxSettable } from "../../types";
import type { SandboxProxy } from "../../../sandbox";

describe("proxySet", function() 
{
	it("should set the verification property", function() 
	{
		const target: SandboxProxy<any> = {};
		const ostensibleProp = CONSTANTS.VERIFICATION.BASIS_SYMBOL;
		const ostensibleValue = 123;

		expect(() => proxySet(target, ostensibleProp, ostensibleValue)).not.to.throw(`Cannot modify property "${String(ostensibleProp)}" of the original object.`);
		expect(target[CONSTANTS.VERIFICATION.BASIS_SYMBOL]).to.equal(ostensibleValue);
	});

	it("should set the sandbox setter property", function() 
	{
		const target: any = {
			[CONSTANTS.VERIFICATION.BASIS_SYMBOL]: "123",
		};
		const value: SandboxSettable = {
			prop: "key",
			value: "newValue",
			[SANDBOX_VERIFIABLE_PROP_SYMBOL]: "123",
		};

		const result = proxySet(target, CONSTANTS.SETTER_SYMBOL, value);
		expect(result).to.be.true;
		expect(target["key"]).to.equal("newValue");
	});

	it("should throw an error for other properties", function() 
	{
		const target = {};
		const ostensibleProp = "key";
		const ostensibleValue = "value";

		expect(() => proxySet(target, ostensibleProp, ostensibleValue)).to.throw("Cannot modify property \"key\" of the original object.");
	});
});
