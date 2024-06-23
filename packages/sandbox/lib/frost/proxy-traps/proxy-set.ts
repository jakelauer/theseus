import { assertValidVerificationProperty } from "../assertions";
import { SANDBOX_VERIFIABLE_PROP_SYMBOL, CONSTANTS } from "../../constants";
import type { SandboxSettable } from "../types";

interface ProxySetterParams
{
	proxy:any
}

export function proxySet(target: any, ostensibleProp: string | symbol, ostensibleValue: any, params: ProxySetterParams): boolean
{
	const { proxy } = params;
	
	// Set the verification property
	if (ostensibleProp == CONSTANTS.FROST.SETTER_SYMBOL) 
	{
		const {
			prop,
			value,
		} = ostensibleValue as SandboxSettable;

		assertValidVerificationProperty(proxy, ostensibleValue[SANDBOX_VERIFIABLE_PROP_SYMBOL]);

		target[prop] = value;

		return true;
	}
	
	throw new Error(`Cannot modify property "${String(ostensibleProp)}" of the original object.`);
}
