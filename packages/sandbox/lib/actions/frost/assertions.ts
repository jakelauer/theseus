import { CONSTANTS } from "sandbox-constants";
import type { SandboxSettable } from "./types.js";

export const assertValidVerificationProperty = (
	verificationOwnerObj: any,
	valueToCheck: any,
): verificationOwnerObj is SandboxSettable => 
{
	const expectedValue = verificationOwnerObj[CONSTANTS.FROST.BASIS_SYMBOL];

	if (expectedValue !== valueToCheck) 
	{
		throw new Error("Invalid verification property.");
	}

	return true;
};
