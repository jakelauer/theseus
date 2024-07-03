import { CONSTANTS } from "../../constants";

export function objectRootIsSandbox(o?: any): boolean 
{
	return !!o?.[CONSTANTS.SANDBOX_SYMBOL];
}
