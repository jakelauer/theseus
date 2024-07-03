import { CONSTANTS } from "../../../constants";
import { symbolCompare } from "../../../symbols/symbol-compare";
import { assertValidVerificationProperty } from "../assertions";
import { objectRootIsFrost } from "../detect/root-is-frost";
import { extractVerificationPropValues } from "../properties";

interface FrostGetterParams
{
	guid: string;
	recursor: (value: any) => any;
}

export function proxyGet(original: any, target: any, prop: string | symbol, params: FrostGetterParams) 
{
	if (symbolCompare(prop, CONSTANTS.FROST.ORIGINAL_GETTER_SYMBOL).looseEqual)
	{
		return original;
	}

	const { guid, recursor } = params;
	const value = Reflect.get(target, prop);
	if (typeof value === "object" && value !== null && !objectRootIsFrost(value)) 
	{
		return recursor(value);
	}
	
	if (symbolCompare(prop, CONSTANTS.FROST.BASIS_SYMBOL).looseEqual)
	{
		return guid;
	}
	/**
	 * To check for valid verification on the proxy, get `proxy[VERIFICATION_CHECK_PROPERTY]`
	 */
	if (typeof prop === "string" && prop.startsWith(CONSTANTS.FROST.CHECK_PROP_PREFIX))
	{
		const verificationValues = extractVerificationPropValues(String(prop));
		if (!verificationValues)
		{
			throw new Error("Invalid verification property");
		}

		return assertValidVerificationProperty(target, verificationValues.verificationValue);
	}

	if (prop === CONSTANTS.FROST.IS_FROSTY)
	{
		return true;
	}

	return target[prop];
}
