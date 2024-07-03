export function symbolStringUndefined(value: any)
{
	return getSymbolString(value) === undefined;
}

export function getSymbolString(value: any)
{
	try 
	{
		return value[Symbol.toStringTag];
	}
	catch (_)
	{
		return null;
	}
}
