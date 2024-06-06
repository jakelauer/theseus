import type { SANDBOX_VERIFIABLE_PROP_SYMBOL } from "../constants";
import type { CONSTANTS } from "../constants";

export interface SandboxSettable
{
	prop: string | symbol;
	value: any;
	[SANDBOX_VERIFIABLE_PROP_SYMBOL]: string;
}

export interface SandboxSetter
{
	[CONSTANTS.SETTER]: SandboxSettable;
}
