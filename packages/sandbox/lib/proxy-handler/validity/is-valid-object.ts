import { getTheseusLogger } from "theseus-logger";
import { symbolStringUndefined } from "../../symbols/symbol-string";

const log = getTheseusLogger("is-valid-object");

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

/**
 * Checks if a variable is an instance of any class or constructor function,
 * including cases where the prototype chain must be traversed multiple levels.
 * 
 * In all normal cases, the prototype chain will be traversed only once.
 *
 * This function will return `true` if the variable's prototype chain includes
 * any constructor that is not the plain `Object` constructor.
 */
function prototypalInstance(variable: any) 
{
	if (variable === null || typeof variable !== "object") 
	{
	  return false;
	}
  
	let prototype = Object.getPrototypeOf(variable);
  
	while (prototype !== null) 
	{
		if (prototype.constructor !== Object) 
		{
			return true;
		}
		prototype = Object.getPrototypeOf(prototype);
	}
  
	return false;
}

export default function isValidObject<T = object>(obj: any): obj is T
{
	const isRealObj = isRealObject(obj);
	const isPlainObj = isPlainObject(obj);

	return isPlainObj && isRealObj && passesValidEdgeCases(obj);
}

function passesValidEdgeCases(obj: any)
{
	const isSymbolStringUndefined = symbolStringUndefined(obj);
	const isPrototypalInstance = prototypalInstance(obj);

	const passes = isSymbolStringUndefined && !isPrototypalInstance;

	if (!passes)
	{
		log.warn("Object cannot be a sandbox or frost proxy because it is either an instance of a class or constructor function, or an instance of a native object.", obj);
	}

	return passes;
}
