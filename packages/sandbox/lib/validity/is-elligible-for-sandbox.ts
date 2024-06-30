import isValidObject from "./is-valid-object";
import type { AtLeastOneItemOfType } from "./types";

type ElligibleForSandbox = object | AtLeastOneItemOfType<object>;

export default function isElligibleForSandbox(value: any): value is ElligibleForSandbox
{
	return Array.isArray(value) || isValidObject(value);
}
