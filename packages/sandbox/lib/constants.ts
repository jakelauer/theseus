const prefix = "__sandbox__";
const sandboxVerificationSymbol = Symbol("__sandbox__verification");
const sandboxVerificationRegexPattern = "_verify_([^_]+)__([a-zA-Z_$][a-zA-Z0-9_$]*)$";

interface SandboxConstants
{
	/**
	 * The prefix used for sandbox properties.
	 */
	PROP_PREFIX: typeof prefix;
	/**
	 * The name of the property which indicates if the object is frosty.
	 */
	IS_FROSTY_PROP: `${typeof prefix}frosty`;
	/**
	 * The name of the setter property.
	 */
	SETTER: `${typeof prefix}set`;
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
	PROP_PREFIX: prefix,	
	SETTER: `${prefix}set`,
	IS_FROSTY_PROP: `${prefix}frosty`,
	VERIFICATION: {
		BASIS_SYMBOL: sandboxVerificationSymbol,
		CHECK_PROP_PREFIX: `${prefix}verify_`,
		REGEX_PATTERN: sandboxVerificationRegexPattern,
		REGEXP: new RegExp(sandboxVerificationRegexPattern),
	}, 
};

export const SANDBOX_VERIFIABLE_PROP_SYMBOL = Symbol(`${prefix}verification`);
