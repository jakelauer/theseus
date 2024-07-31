import { CONSTANTS } from "sandbox-constants";
import { symbolCompare } from "../../../symbols/symbol-compare.js";
import { assertValidVerificationProperty } from "../assertions.js";
import { objectRootIsFrost } from "../detect/root-is-frost.js";
import { extractVerificationPropValues } from "../properties.js";

interface FrostGetterParams {
    guid: string;
    recursor: (value: any) => any;
}

export function proxyGet(original: any, target: any, prop: string | symbol, params: FrostGetterParams) 
{
	const { guid, recursor } = params;

	// If the property is the original getter symbol, return the original object
	if (symbolCompare(prop, CONSTANTS.FROST.ORIGINAL_GETTER_SYMBOL).looseEqual) 
	{
		return original;
	}

	// If the property is the basis symbol, return this proxy's guid. This is used for verification.
	if (symbolCompare(prop, CONSTANTS.FROST.BASIS_SYMBOL).looseEqual) 
	{
		return guid;
	}

	// If the value is a valid object, apply the recursor (frost) to it. This ensures that the entire object is frosty.
	const value = Reflect.get(target, prop);
	if (typeof value === "object" && value !== null && !objectRootIsFrost(value)) 
	{
		return recursor(value);
	}

	// If a verification property is accessed, assert that it is valid
	if (typeof prop === "string" && prop.startsWith(CONSTANTS.FROST.CHECK_PROP_PREFIX)) 
	{
		const verificationValues = extractVerificationPropValues(String(prop));
		if (!verificationValues) 
		{
			throw new Error("Invalid verification property");
		}

		return assertValidVerificationProperty(target, verificationValues.verificationValue);
	}

	// Allows for quick checking if an object is frosty, without having to
	if (prop === CONSTANTS.FROST.IS_FROSTY) 
	{
		return true;
	}

	return target[prop];
}
