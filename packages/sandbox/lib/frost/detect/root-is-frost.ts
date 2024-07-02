import { CONSTANTS } from "../../constants";
import isElligibleForProxy from "../../proxy-handler/validity/is-elligible-for-proxy";

export function objectRootIsFrost(o?: any): boolean 
{
	return isElligibleForProxy(o) && (o as any)[CONSTANTS.FROST.BASIS_SYMBOL] !== undefined;;
}
