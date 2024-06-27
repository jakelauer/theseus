import isValidObject from "./is-valid-object";

export default function isElligibleForSandbox<T>(value: any): value is T 
{
	return Array.isArray(value) || isValidObject(value);
}
