import isValidObject from "./is-valid-object";
import type { AtLeastOneItemOfType } from "./types";

type ElligibleForProxy = object | AtLeastOneItemOfType<object>;


export default function isElligibleForProxy(value: any): value is ElligibleForProxy
{
	return Array.isArray(value) || isValidObject(value);
}
