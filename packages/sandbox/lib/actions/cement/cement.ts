import { CONSTANTS, SANDBOX_VERIFIABLE_PROP_SYMBOL } from "../../constants";
import { frostClone } from "../frost";
import { generateVerificationProperty, getVerificationValueFromObject } from "../frost/properties";
import { containsSandbox, type SandboxMode } from "../sandbox";
import structuredClone from "@ungap/structured-clone";
import isElligibleForProxy from "../../proxy-handler/validity/is-elligible-for-proxy";
import { sandboxTransform } from "../sandbox/sandbox-transform";
import { isFrost } from "../frost/detect/is-frost-proxy";
import { symbolCompare } from "../../symbols/symbol-compare";

/**
 * Finalizes the changes made in a sandbox proxy object and returns a new object with those changes applied.
 * If the provided object is not a sandbox proxy, it returns the object as-is.
 *
 * @template T - The type of the object.
 * @param {T} obj - The object to finalize.
 * @returns {T} - A new object with changes applied, or the object itself if it's not a sandbox proxy.
 */
export function cement<T extends object>(obj: T): T 
{
	let finalResult = obj;

	// If the object is a sandbox proxy at the root level, apply the changes
	const rootCemented = cementAtRoot(obj);
	if (rootCemented !== undefined)
	{
		finalResult = rootCemented;
	}

	// If the object contains nested sandbox proxies, apply the changes recursively.
	// We don't need to check for situations where there are non-sandbox-proxies between
	// a sb-root and a sb-nested, because sb-root objects are recursively sandboxed, so
	// any changes to nested objects will also be sandboxed if the root is sandboxed.
	if (containsSandbox(finalResult))
	{
		finalResult = sandboxTransform(finalResult, (val) => 
		{
			return cement(val);
		}, isElligibleForProxy);
	}

	return finalResult;
}

function cementAtRoot<T extends object>(obj: T): T 
{
	let original: T, changes: Record<string | symbol, any>, mode: SandboxMode, isSandbox = false;
	try 
	{
		// If this errors, the object is not a sandbox proxy
		const sbMetadata = obj[CONSTANTS.SANDBOX_SYMBOL];
		original = sbMetadata.original;
		changes = sbMetadata.changes;
		mode = sbMetadata.params.mode;
		isSandbox = true;
	}
	catch 
	{
		// Not really an error case, just means the object is not a sandbox proxy
	}

	if (isSandbox) 
	{
		const toModify = getModifiableObject(original, mode);
	
		return applyChanges(toModify, changes);
	}
}

function getModifiableObject<T extends object>(obj: T, mode: SandboxMode): T
{
	// modify mode, non-frost-proxy
	let result = obj;

	if (mode === "copy")
	{
		// if the object is a frost proxy, clone it and frost it, otherwise structured clone it
		result = isFrost(obj) 
			? frostClone(obj) 
			: structuredClone(obj, {
				lossy: false, 
			});
	}

	return result;
}

/**
 * Applies changes to a target object.
 *
 * @template T - The type of the object.
 * @param {T} target - The target object to apply changes to.
 * @param {Record<string | symbol, any>} changes - The changes to apply.
 * @returns {T} - The modified object.
 */
function applyChanges<T extends object>(target: any, changes: Record<string | symbol, any>): T 
{
	const targetIsFrost = (target as any)[CONSTANTS.FROST.IS_FROSTY];

	const allKeys = new Set([...Object.keys(target), ...Object.keys(changes)]);

	for (const key of allKeys) 
	{
		const newValue = changes[key];

		// If the key is not in the target object, add it
		if (!Object.prototype.hasOwnProperty.call(target, key))
		{
			const newValue = changes[key];
			const setValue = isElligibleForProxy(newValue) ? cement(newValue) : newValue;
			handleSet(target, key, setValue, targetIsFrost);
		}
		// If the value is a nested object, apply changes recursively
		else if (isElligibleForProxy(newValue)) 
		{
			const cemented = cement(newValue);
			handleSet(target, key, cemented, targetIsFrost);
		}
		// If the value is a deletion symbol, delete the property
		else if (symbolCompare(newValue, CONSTANTS.FROST.DELETION_SYMBOL).looseEqual)
		{
			handleDeletion(target, key, targetIsFrost);
		}
		// if the key is in changes, apply the change
		else if (Object.prototype.hasOwnProperty.call(changes, key))
		{
			handleSet(target, key, newValue, targetIsFrost);
		}
		// otherwise, do nothing
	}

	return target;
}

/**
 * Handles deletion of properties from the target object.
 *
 * @template T - The type of the object.
 * @param {T} target - The target object.
 * @param {string} key - The key of the property to delete.
 * @param {boolean} isFrost - Whether the target is of type Frost.
 */
function handleDeletion(target: any, originalKey: string, isFrost: boolean): void 
{
	const key = isFrost ? generateVerificationProperty(target, originalKey) : originalKey;
	delete target[key];
}

function handleSet(target: any, key: string, newValue: any, isFrost: boolean): void 
{
	if (isFrost) 
	{
		target[CONSTANTS.FROST.SETTER_SYMBOL] = {
			prop: key,
			value: newValue,
			[SANDBOX_VERIFIABLE_PROP_SYMBOL]: getVerificationValueFromObject(target),
		};
	}
	else 
	{
		target[key] = newValue;
	}
}
