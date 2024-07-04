import { CONSTANTS } from "sandbox-constants";

export function objectRootIsSandbox(o?: any): boolean 
{
	return !!o?.[CONSTANTS.SANDBOX_SYMBOL];
}
