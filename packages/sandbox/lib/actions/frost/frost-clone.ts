import structuredClone from "@ungap/structured-clone";
import { CONSTANTS } from "sandbox-constants";
import { frost } from "./frost.js";

/**
 * Clones a frost object and returns a new frost object.
 */
export function frostClone<T extends object>(originalObject: T): Readonly<T> 
{
	const clone = structuredClone(originalObject, {
		lossy: false,
	});

	// This is just a getter in the original object, which means it appears in the clone
	// as a normal property. We need to remove it.
	delete (clone as any)[CONSTANTS.FROST.BASIS_SYMBOL];

	return frost(clone);
}
