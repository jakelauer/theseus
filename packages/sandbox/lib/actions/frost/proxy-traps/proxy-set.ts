import { assertValidVerificationProperty } from "../assertions.js";
import { SANDBOX_VERIFIABLE_PROP_SYMBOL, CONSTANTS } from "sandbox-constants";
import type { SandboxSettable } from "../types.js";
import { symbolCompare } from "../../../symbols/symbol-compare.js";

interface ProxySetterParams {
    proxy: any;
}

/**
 * Setting values must be done according to a specific pattern, using the frost setter symbol, otherwise an error is thrown.
 *
 * The pattern is works this way:
 *
 * Here is an example of the normal way of setting a value:
 *
 * const original = { a: 1 };
 * const frosty = frost(original);
 *
 * // This will throw an error, because the property is being set directly on the original object.
 * frosty.a = 2;
 *
 *
 * Here is an example of the way frost requires values to be set:
 * const original = { a: 1 };
 * const frosty = frost(original);
 *
 * frosty[CONSTANTS.FROST.SETTER_SYMBOL] = {
 * 		prop: "a",
 * 		value: 2,
 *		[SANDBOX_VERIFIABLE_PROP_SYMBOL]: "verification-value-from-proxy", // The verification value lives at frosty[CONSTANTS.FROST.BASIS_SYMBOL]
 * };
 *
 * This will set the value of "a" to 2 on the original object. `cement` uses this pattern to apply changes from a sandbox, ensuring the original
 * object can *only* be modified by the sandbox (or by a very determined bad actor). The intent is not to prevent all modification, but to ensure
 * that all modifications are intentional and traceable.
 */
export function proxySet(
	target: any,
	ostensibleProp: string | symbol,
	ostensibleValue: any,
	params: ProxySetterParams,
): boolean 
{
	const { proxy } = params;

	if (symbolCompare(ostensibleProp, CONSTANTS.FROST.SETTER_SYMBOL).looseEqual) 
	{
		const { prop, value } = ostensibleValue as SandboxSettable;

		assertValidVerificationProperty(proxy, ostensibleValue[SANDBOX_VERIFIABLE_PROP_SYMBOL]);

		target[prop] = value;

		return true;
	}

	throw new Error(`Cannot modify property "${String(ostensibleProp)}" of the original object.`);
}
