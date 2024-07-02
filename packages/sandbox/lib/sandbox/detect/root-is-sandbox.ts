import { CONSTANTS } from "../../constants";
import isElligibleForProxy from "../../proxy-handler/validity/is-elligible-for-proxy";

export function objectRootIsSandbox(o?: any): boolean 
{
	return isElligibleForProxy(o) && !!o[CONSTANTS.SANDBOX_SYMBOL];
}
