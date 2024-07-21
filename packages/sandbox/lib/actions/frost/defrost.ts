import { CONSTANTS } from "sandbox-constants";
import { objectRootIsFrost } from "./detect/root-is-frost.js";
import isElligibleForProxy from "../../proxy-handler/validity/is-elligible-for-proxy.js";
import type { StrictnessOptions } from "../../strictness/strictness.js";
import { fail } from "../../strictness/strictness.js";

function defrostLayer<T extends object>(obj: T, opts?: StrictnessOptions): T 
{
	if (objectRootIsFrost(obj)) 
	{
		return obj[CONSTANTS.FROST.ORIGINAL_GETTER_SYMBOL];
	}

	if (opts?.strict) 
	{
		fail(opts, "defrost called on non-frost object");
	}

	return obj;
}

export function defrost<T extends object>(obj: T, opts?: StrictnessOptions): T 
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
