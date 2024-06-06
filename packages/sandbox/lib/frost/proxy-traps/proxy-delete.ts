import { assertValidVerificationProperty } from "../assertions";
import { CONSTANTS } from "../../constants";
import { propertyStartsWith, extractVerificationPropValues } from "../properties";

/**
 * When an attempt to delete a property is made, this function is called. If called
 * normally outside the sandbox environment (e.g. delete myObject.prop), it will
 * throw an error. If called from within the sandbox, the sandbox will provide
 * the necessary verification to allow the deletion.
 * 
 * Inside the sandbox, the property can be deleted by calling `delete myObject.__sandbox__.prop`.
 */
export function proxyDelete<T>(target: T, ostensibleProp: string | symbol): boolean
{
	if (ostensibleProp === CONSTANTS.VERIFICATION.BASIS_SYMBOL)
	{
		delete target[CONSTANTS.VERIFICATION.BASIS_SYMBOL];
		
		return true;
	}
	else if (propertyStartsWith(ostensibleProp, CONSTANTS.PROP_PREFIX))
	{
		const propString = typeof ostensibleProp === "symbol" ? ostensibleProp.description : ostensibleProp;
		const propContents = extractVerificationPropValues(propString);
		if (propContents)
		{
			const {
				verificationValue,
				propertyName,
			} = propContents;

			assertValidVerificationProperty(target, verificationValue);
				
			delete target[propertyName];
		
			return true;
		}
		
		return false;
	}
	
	throw new Error(`Cannot modify property "${String(ostensibleProp)}" of the original object.`);
}
