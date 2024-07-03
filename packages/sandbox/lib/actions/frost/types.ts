import type { SANDBOX_VERIFIABLE_PROP_SYMBOL, CONSTANTS } from "../../constants";

export interface SandboxSettable
{
	prop: string | symbol;
	value: any;
	[SANDBOX_VERIFIABLE_PROP_SYMBOL]: string;
}

export interface SandboxSetter
{
	[CONSTANTS.FROST.SETTER_SYMBOL]: SandboxSettable;
}

export type FrostProxy<T extends object> = T & {
	[CONSTANTS.FROST.BASIS_SYMBOL]: string;
	[CONSTANTS.FROST.IS_FROSTY]: true;
}
