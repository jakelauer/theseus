import isValidObject from "./is-valid-object.js";
import type { AtLeastOneItemOfType } from "./types.js";

type ElligibleForProxy = object | AtLeastOneItemOfType<object>;

export default function isElligibleForProxy(value: any): value is ElligibleForProxy 
{
	return Array.isArray(value) || isValidObject(value);
}
