import { CONSTANTS } from "sandbox-constants";
export function propertyStartsWith(prop: string | symbol, searchString: string): boolean 
{
	if (typeof prop === "string") 
	{
		return prop.startsWith(searchString);
	}
	else if (typeof prop === "symbol") 
	{
		return prop.description ? prop.description.startsWith(searchString) : false;
	}
	return false;
}

export function extractVerificationPropValues(input: string) 
{
	const match = input.match(/__verify_([^_]+)__([a-zA-Z_$][a-zA-Z0-9_$]*)$/);
	
	if (match) 
	{
		const [_, verificationValue, propertyName] = match;
		return {
			verificationValue,
			propertyName, 
		};
	}
}

export function generateVerificationProperty(verificationValue: string, propertyName: string): string;
export function generateVerificationProperty(obj: object, propertyName: string): string;
export function generateVerificationProperty(
	arg1: string | object,
	arg2: string,
): string 
{
	if (typeof arg1 === "string") 
	{
		return `${CONSTANTS.FROST.CHECK_PROP_PREFIX}${arg1}__${arg2}`;
	}
	else if (typeof arg1 === "object") 
	{
		const basisSymbolValue = getVerificationValueFromObject(arg1);
		return `${CONSTANTS.FROST.CHECK_PROP_PREFIX}${basisSymbolValue}__${arg2}`;
	}
	
	throw new Error("Invalid arguments");
}

export function getVerificationValueFromObject(target: any): string 
{
	const basisSymbolValue = target[CONSTANTS.FROST.BASIS_SYMBOL];
	if (typeof basisSymbolValue === "string")
	{
		return basisSymbolValue;
	}
	else 
	{
		throw new Error("Verification basis symbol must be a string.");
	}
}
