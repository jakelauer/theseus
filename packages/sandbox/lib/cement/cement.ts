import { CONSTANTS, SANDBOX_VERIFIABLE_PROP_SYMBOL } from "../constants";
import { generateVerificationProperty, getVerificationValueFromObject } from "../frost/properties";
import { isSandboxProxy } from "../sandbox/is-sandbox-proxy";
import structuredClone from "@ungap/structured-clone";

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
	if (isSandboxProxy(obj)) 
	{
		const {
			original,
			changes,
			params: {
				mode,
			},
		} = obj[CONSTANTS.SANDBOX_SYMBOL];

		const toModify = mode === "modify" ? original : structuredClone(original, { lossy: true });

		return applyChanges(toModify, changes);
	}
	else 
	{
		throw new Error("Cannot cement an object that is not a sandbox.");
	}
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
	const targetIsFrost = (target as any)[CONSTANTS.IS_FROSTY_PROP];

	const allKeys = new Set([...Object.keys(target), ...Object.keys(changes)]);

	for (const key of allKeys) 
	{
		const oldValue = target[key];
		const newValue = changes[key];

		// If the key is not in the target object, add it
		if (!Object.prototype.hasOwnProperty.call(target, key))
		{
			const newValue = changes[key];
			handleSet(target, key, newValue, targetIsFrost);
		}
		// If the value is a nested object, apply changes recursively
		else if (isSandboxProxy(oldValue)) 
		{
			handleSet(target, key, cement(oldValue), targetIsFrost);
		}
		// If the value is a deletion symbol, delete the property
		else if (newValue === CONSTANTS.DELETION_SYMBOL) 
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

	delete target[CONSTANTS.SETTER_SYMBOL];
	delete target[CONSTANTS.SANDBOX_SYMBOL];
	delete target[CONSTANTS.VERIFICATION.BASIS_SYMBOL];

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
		target[CONSTANTS.SETTER_SYMBOL] = {
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
