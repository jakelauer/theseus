import { assertValidVerificationProperty } from "../assertions";
import { CONSTANTS } from "../../constants";
import { propertyStartsWith, extractVerificationPropValues } from "../properties";
import { symbolCompare } from "../../symbol-compare";

interface ProxyDeleterParams
{
	proxy:any
}

/**
 * When an attempt to delete a property is made, this function is called. If called
 * normally outside the sandbox environment (e.g. delete myObject.prop), it will
 * throw an error. If called from within the sandbox, the sandbox will provide
 * the necessary verification to allow the deletion.
 * 
 * Inside the sandbox, the property can be deleted by calling `delete myObject[CONSTANTS.SANDBOX_SYMBOL].prop`.
 */
export function proxyDelete(target: any, ostensibleProp: string | symbol, params: ProxyDeleterParams): boolean
{
	const { proxy } = params;

	const deletableConstants = {
		[CONSTANTS.SANDBOX_SYMBOL]: true,
		[CONSTANTS.FROST.BASIS_SYMBOL]: true,
		[CONSTANTS.FROST.SETTER_SYMBOL]: true,
	};

	const isSpecialSymbol = typeof ostensibleProp === "symbol" && Object.getOwnPropertySymbols(deletableConstants).find((c) => symbolCompare(ostensibleProp, c).looseEqual);

	// Allow deletion of constants for sandbox
	if (isSpecialSymbol)
	{
		delete target[ostensibleProp];
		
		return true;
	}
	else if (propertyStartsWith(ostensibleProp, CONSTANTS.FROST.PREFIX))
	{
		const propString = typeof ostensibleProp === "symbol" ? ostensibleProp.description : ostensibleProp;
		if (!propString)
		{
			throw new Error("Property string is empty");
		}
		
		const propContents = extractVerificationPropValues(propString);
		if (propContents)
		{
			const {
				verificationValue,
				propertyName,
			} = propContents;

			assertValidVerificationProperty(proxy, verificationValue);
				
			delete target[propertyName];
		
			return true;
		}
		
		return false;
	}
	
	throw new Error(`Cannot modify property "${String(ostensibleProp)}" of the original object.`);
}
