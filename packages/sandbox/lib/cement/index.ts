import { CONSTANTS, SANDBOX_VERIFIABLE_PROP_SYMBOL } from "../constants";
import { generateVerificationProperty, getVerificationValueFromObject } from "../frost/properties";
import { isSandboxProxy } from "../sandbox";

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
		} = obj[CONSTANTS.PROP_PREFIX];

		const toModify = mode === "modify" ? original : { ...original };

		return applyChanges(toModify, changes);
	}

	return obj;
}
/**
 * Applies changes to a target object.
 *
 * @template T - The type of the object.
 * @param {T} target - The target object to apply changes to.
 * @param {Record<string | symbol, any>} changes - The changes to apply.
 * @returns {T} - The modified object.
 */
function applyChanges<T extends object>(target: T, changes: Record<string | symbol, any>): T 
{
	const targetIsFrost = (target as any)[CONSTANTS.IS_FROSTY_PROP];
    
	for (const [key, value] of Object.entries(changes)) 
	{
		if (value === undefined) 
		{
			handleDeletion(target, key, targetIsFrost);
		}
		else if (value !== target[key] && key !== CONSTANTS.PROP_PREFIX)
		{
			handleChange(target, key, value, targetIsFrost);
		}
	}

	delete target[CONSTANTS.SETTER];
	delete target[CONSTANTS.PROP_PREFIX];
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
function handleDeletion<T extends object>(target: T, originalKey: string, isFrost: boolean): void 
{
	const key = isFrost ? generateVerificationProperty(target, originalKey) : originalKey;
	delete target[key];
}

function handleChange<T extends object>(target: T, originalKey: string, originalValue: any, isFrost: boolean): void
{
	if (isFrost)
	{
		target[CONSTANTS.SETTER] = {
			prop: originalKey,
			value: originalValue,
			[SANDBOX_VERIFIABLE_PROP_SYMBOL]: getVerificationValueFromObject(target),
		};
	}
	else 
	{
		target[originalKey] = originalValue;
	}
}
