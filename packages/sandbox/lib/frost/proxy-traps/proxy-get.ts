import { CONSTANTS } from "../../constants";
import { assertValidVerificationProperty } from "../assertions";
import { extractVerificationPropValues } from "../properties";

export function proxyGet(target: any, prop: string | symbol) 
{
	/**
	 * To check for valid verification on the proxy, get `proxy[VERIFICATION_CHECK_PROPERTY]`
	 */
	if (typeof prop === "string" && prop.startsWith(CONSTANTS.VERIFICATION.CHECK_PROP_PREFIX))
	{
		const verificationValues = extractVerificationPropValues(String(prop));
		if (!verificationValues)
		{
			throw new Error("Invalid verification property");
		}

		return assertValidVerificationProperty(target, verificationValues.verificationValue);
	}

	if (prop === CONSTANTS.IS_FROSTY_PROP)
	{
		return true;
	}

	return target[prop];
}
