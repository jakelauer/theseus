import { expect } from "chai";

// Mock the assertValidVerificationProperty function
import { SANDBOX_VERIFIABLE_PROP_SYMBOL, CONSTANTS } from "sandbox-constants";
import { proxySet } from "../proxy-set";
import type { SandboxSettable } from "../../types";

describe("proxySet", function() 
{
	it("should set the sandbox setter property", function() 
	{
		const target: any = {
			[CONSTANTS.FROST.BASIS_SYMBOL]: "123",
		};
		const value: SandboxSettable = {
			prop: "key",
			value: "newValue",
			[SANDBOX_VERIFIABLE_PROP_SYMBOL]: "123",
		};

		const result = proxySet(target, CONSTANTS.FROST.SETTER_SYMBOL, value, {
			proxy: target, 
		});
		expect(result).to.be.true;
		expect(target["key"]).to.equal("newValue");
	});

	it("should throw an error for other properties", function() 
	{
		const target = {};
		const ostensibleProp = "key";
		const ostensibleValue = "value";

		expect(() => proxySet(target, ostensibleProp, ostensibleValue, {
			proxy: target, 
		})).to.throw("Cannot modify property \"key\" of the original object.");
	});
});
