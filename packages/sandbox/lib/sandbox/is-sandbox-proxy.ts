import { CONSTANTS } from "../constants";
import type { SandboxProxy } from "./types";


/**
 * Determines if the given object is a sandbox proxy.
 *
 * @template T - The type of the object.
 * @param {T} obj - The object to check.
 * @returns {obj is SandboxProxy<T>} - True if the object is a sandbox proxy, false otherwise.
 */
export function isSandboxProxy<T extends object>(obj: T): obj is SandboxProxy<T> 
{
	return !!(obj as any)[CONSTANTS.PROP_PREFIX];
}
