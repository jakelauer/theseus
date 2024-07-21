import { assertValidVerificationProperty } from "../assertions.js";
import { SANDBOX_VERIFIABLE_PROP_SYMBOL, CONSTANTS } from "sandbox-constants";
import type { SandboxSettable } from "../types.js";
import { symbolCompare } from "../../../symbols/symbol-compare.js";

interface ProxySetterParams {
    proxy: any;
}

export function proxySet(
	target: any,
	ostensibleProp: string | symbol,
	ostensibleValue: any,
	params: ProxySetterParams,
): boolean 
{
	const { proxy } = params;

	// Set the verification property
	if (symbolCompare(ostensibleProp, CONSTANTS.FROST.SETTER_SYMBOL).looseEqual) 
	{
		const { prop, value } = ostensibleValue as SandboxSettable;

		assertValidVerificationProperty(proxy, ostensibleValue[SANDBOX_VERIFIABLE_PROP_SYMBOL]);

		target[prop] = value;

		return true;
	}

	throw new Error(`Cannot modify property "${String(ostensibleProp)}" of the original object.`);
}
