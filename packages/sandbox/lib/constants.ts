const sandboxPrefix = "__sandbox__";
const frostPrefix = "__frost__";
const frostVerificationRegexPattern = "_verify_([^_]+)__([a-zA-Z_$][a-zA-Z0-9_$]*)$";
const frostVerificationSymbol = Symbol(`${frostPrefix}verification`);
const sandboxSymbol = Symbol(sandboxPrefix);
const deletionSymbol = Symbol(`${frostPrefix}delete`);
const setterSymbol = Symbol(`${frostPrefix}set`);

interface SandboxConstants
{
	/**
	 * The prefix used for sandbox properties.
	 */
	PREFIX: typeof sandboxPrefix;
	/**
	 * The symbol used to indicate a sandbox object.
	 */
	readonly SANDBOX_SYMBOL: typeof sandboxSymbol;
}

interface FrostConstants
{

	/**
	 * Constants related to verification.
	 */
	FROST: {
		/**
		 * The prefix used for frost properties.
		 */
		PREFIX: typeof frostPrefix;
		/**
		 * The name of the property which indicates if the object is frosty.
		 */
		IS_FROSTY: `${typeof frostPrefix}frosty`;
		/**
		 * The symbol used as a key to hold the verification value.
		 */
		readonly BASIS_SYMBOL: typeof frostVerificationSymbol;
		/**
		 * The prefix for properties used to validate a verification value;
		 */
		CHECK_PROP_PREFIX: `${typeof frostPrefix}verify_`;
		/**
		 * The regex pattern used to extract verification values. Props which contain
		 * a verification value need to follow the pattern, e.g. `__sandbox__verify_123__propName`.
		 */
		REGEX_PATTERN: typeof frostVerificationRegexPattern;
		/**
		 * The regex used to extract verification values. Props which contain
		 * a verification value need to follow the pattern, e.g. `__sandbox__verify_123__propName`.
		 */
		readonly REGEXP: RegExp;
		/**
		 * The name of the setter property.
		 */
		SETTER_SYMBOL: typeof setterSymbol;
		/**
		 * The symbol used to indicate a deletion.
		 */
		DELETION_SYMBOL: typeof deletionSymbol;
	};
}

type Constants = SandboxConstants & FrostConstants;

export const CONSTANTS: Constants = {
	PREFIX: sandboxPrefix,	
	SANDBOX_SYMBOL: sandboxSymbol,
	FROST: {
		PREFIX: frostPrefix,
		IS_FROSTY: `${frostPrefix}frosty`,
		BASIS_SYMBOL: frostVerificationSymbol,
		CHECK_PROP_PREFIX: `${frostPrefix}verify_`,
		REGEX_PATTERN: frostVerificationRegexPattern,
		REGEXP: new RegExp(frostVerificationRegexPattern),
		SETTER_SYMBOL: setterSymbol,
		DELETION_SYMBOL: deletionSymbol,
	}, 
};

export const SANDBOX_VERIFIABLE_PROP_SYMBOL = Symbol(`${sandboxPrefix}verification`);
