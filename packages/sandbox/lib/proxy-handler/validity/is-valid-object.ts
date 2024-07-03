import { symbolStringUndefined } from "../../symbols/symbol-string";

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

export default function isValidObject<T = object>(obj: any): obj is T
{
	const hasUndefinedSymbol = symbolStringUndefined(obj);

	return hasUndefinedSymbol && isRealObject(obj) && isPlainObject(obj);
}
