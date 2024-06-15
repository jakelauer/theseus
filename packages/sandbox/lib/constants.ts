const prefix = "__sandbox__";
const sandboxVerificationSymbol = Symbol("__sandbox__verification");
const sandboxVerificationRegexPattern = "_verify_([^_]+)__([a-zA-Z_$][a-zA-Z0-9_$]*)$";
const sandboxSymbol = Symbol(prefix);
const deletionSymbol = Symbol(`${prefix}delete`);

interface SandboxConstants
{
	/**
	 * The prefix used for sandbox properties.
	 */
	PREFIX: typeof prefix;
	/**
	 * The symbol used to indicate a sandbox object.
	 */
	readonly SANDBOX_SYMBOL: typeof sandboxSymbol;
	/**
	 * The name of the property which indicates if the object is frosty.
	 */
	IS_FROSTY_PROP: `${typeof prefix}frosty`;
	/**
	 * The name of the setter property.
	 */
	SETTER: `${typeof prefix}set`;

	/**
	 * The symbol used to indicate a deletion.
	 */
	DELETION_SYMBOL: typeof deletionSymbol;

	/**
	 * Constants related to verification.
	 */
	VERIFICATION: {
		/**
		 * The symbol used as a key to hold the verification value.
		 */
		readonly BASIS_SYMBOL: typeof sandboxVerificationSymbol;
		/**
		 * The prefix for properties used to validate a verification value;
		 */
		CHECK_PROP_PREFIX: `${typeof prefix}verify_`;
		/**
		 * The regex pattern used to extract verification values. Props which contain
		 * a verification value need to follow the pattern, e.g. `__sandbox__verify_123__propName`.
		 */
		REGEX_PATTERN: typeof sandboxVerificationRegexPattern;
		/**
		 * The regex used to extract verification values. Props which contain
		 * a verification value need to follow the pattern, e.g. `__sandbox__verify_123__propName`.
		 */
		readonly REGEXP: RegExp;
	};
}

export const CONSTANTS: SandboxConstants = {
	PREFIX: prefix,	
	SANDBOX_SYMBOL: sandboxSymbol,
	SETTER: `${prefix}set`,
	IS_FROSTY_PROP: `${prefix}frosty`,
	DELETION_SYMBOL: deletionSymbol,
	VERIFICATION: {
		BASIS_SYMBOL: sandboxVerificationSymbol,
		CHECK_PROP_PREFIX: `${prefix}verify_`,
		REGEX_PATTERN: sandboxVerificationRegexPattern,
		REGEXP: new RegExp(sandboxVerificationRegexPattern),
	}, 
};

export const SANDBOX_VERIFIABLE_PROP_SYMBOL = Symbol(`${prefix}verification`);
