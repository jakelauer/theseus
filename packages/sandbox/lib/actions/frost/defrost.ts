import { CONSTANTS } from "sandbox-constants";
import { objectRootIsFrost } from "./detect/root-is-frost";
import isElligibleForProxy from "../../proxy-handler/validity/is-elligible-for-proxy";

interface DefrostOptions
{
	/**
	 * The mode to use when defrosting the object.
	 * Options:
	 * - "loose" (default): Will not throw an error if the object is not a frost object.
	 * - "strict": Will throw an error if the object is not a frost object.
	 */
	mode?: "strict" | "loose";
}

function defrostLayer<T extends object>(obj: T, opts?: DefrostOptions): T 
{
	if (objectRootIsFrost(obj))
	{
		return obj[CONSTANTS.FROST.ORIGINAL_GETTER_SYMBOL];
	}

	if (opts?.mode === "strict")
	{
		throw new Error("defrost called on non-frost object");
	}

	return obj;
}

export function defrost<T extends object>(obj: T, opts?: DefrostOptions): T 
{
	const root = defrostLayer(obj, opts);
	
	for (const key in root)
	{
		const innerValue = root[key];
		if (isElligibleForProxy(innerValue))
		{
			root[key] = defrost(innerValue);
		}
	}

	return root;
}
