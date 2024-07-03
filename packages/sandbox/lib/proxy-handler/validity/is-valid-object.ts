function isPlainObject(obj: any) 
{
	return Object.prototype.toString.call(obj) === "[object Object]";
}

function isRealObject<T = object>(obj: any): obj is T
{
	const type = typeof obj;
	const isFunction = type === "function";
	const isObject = type === "object";
	const hasValue = obj !== null && obj !== undefined;
	return hasValue && (isObject || isFunction);
}

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

export default function isValidObject<T = object>(obj: any): obj is T
{
	const hasUndefinedSymbol = symbolStringUndefined(obj);

	return hasUndefinedSymbol && isRealObject(obj) && isPlainObject(obj);
}
