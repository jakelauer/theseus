import { CONSTANTS } from "sandbox-constants";

export function objectRootIsFrost(o?: any): boolean 
{
	return !!o?.[CONSTANTS.FROST.BASIS_SYMBOL];
}
