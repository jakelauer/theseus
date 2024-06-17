import { assertValidVerificationProperty } from "../assertions";
import { SANDBOX_VERIFIABLE_PROP_SYMBOL, CONSTANTS } from "../../constants";
import type { SandboxSettable } from "../types";

export function proxySet(target: any, ostensibleProp: string | symbol, ostensibleValue: any): boolean
{
	// Set the verification property
	if (ostensibleProp === CONSTANTS.VERIFICATION.BASIS_SYMBOL) 
	{
		target[CONSTANTS.VERIFICATION.BASIS_SYMBOL as any] = ostensibleValue;

		return true;
	}
	else if (ostensibleProp == CONSTANTS.SETTER_SYMBOL && !!target[CONSTANTS.VERIFICATION.BASIS_SYMBOL]) 
	{
		const {
			prop,
			value,
		} = ostensibleValue as SandboxSettable;

		assertValidVerificationProperty(target, ostensibleValue[SANDBOX_VERIFIABLE_PROP_SYMBOL]);

		target[prop] = value;

		return true;
	}
	
	throw new Error(`Cannot modify property "${String(ostensibleProp)}" of the original object.`);
}
