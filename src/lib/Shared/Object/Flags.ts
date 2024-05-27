/** Converts a bitwise enum value to an array of flag names. */
export const enumValToFlagNames = (enumVal: number, flagObj: Record<number, any>) => 
{
	const binaryString = enumVal.toString(2);
	const flagNames = flagNamesFromBinaryString(binaryString, flagObj);
	return flagNames.join(", ");
};

/** Converts a binary string to an array of flag names. */
export const flagNamesFromBinaryString = (binaryString: string, flagObj: Record<number, any>) => 
{
	assertStringIsBinary(binaryString);

	const flagNames: string[] = [];
	for (let i = 0; i < binaryString.length; i++) 
	{
		if (binaryString[i] === "1") 
		{
			// The power of the index is calculated by subtracting the index from the length of the binary string.
			// This is because the index is zero-based, but the power of 2 is calculated from the rightmost digit.
			const powerOfIndex = binaryString.length - 1 - i;

			// The index of the flag object is calculated by raising 2 to the power of the index.
			const flagObjIndex = 2 ** powerOfIndex;

			const flagName = flagObj[flagObjIndex];
			flagNames.push(flagName);
		}
	}

	return flagNames;
};

/** Asserts that a string is composed of only 0s and 1s. */
const assertStringIsBinary = (binaryString: string) => 
{
	if (!/^[01]+$/.test(binaryString)) 
	{
		throw new Error("Input string must be a binary string");
	}
};
