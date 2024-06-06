import { CONSTANTS } from "../constants";
import type { SandboxSettable } from "./types";

export const assertValidVerificationProperty = (verificationOwnerObj: any, valueToCheck: any): verificationOwnerObj is SandboxSettable => 
{
	const expectedValue = verificationOwnerObj[CONSTANTS.VERIFICATION.BASIS_SYMBOL];

	if (expectedValue !== valueToCheck)
	{
		throw new Error("Invalid verification property.");
	}

	return true;
};
