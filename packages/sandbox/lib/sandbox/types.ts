import type { CONSTANTS } from "../constants";

export type SandboxMode = "copy" | "modify";

export type SandboxParams = {
	/**
	 * The mode in which the sandbox proxy operates. 
	 * 
	 * "copy" - The sandbox proxy will not modify the original object. It will create a copy of the original object 
	 * and apply changes to the copy.
	 * 
	 * "copy" - The sandbox proxy will create a deep-frozen copy of the original object.
	 * 
	 * Default value is "modify".
	 * 
	 * If the mode is set to "copy", and an
	 * uneditable property is modified, the sandbox proxy will throw an error.
	 */
	mode: SandboxMode;
}

/**
 * Represents the properties of a sandbox proxy object.
 *
 * @template T - The type of the original object.
 */
export interface SandboxProxyProps<T> {
    /**
     * The sandbox metadata.
     */
    [CONSTANTS.SANDBOX_SYMBOL]: {
        /**
         * A unique identifier for the sandbox instance.
         */
        id: string;
        /**
         * A record of changes made to the sandbox proxy.
         */
        changes: Partial<T>;
        /**
         * The original object being proxied.
         */
        original: T;

		params: SandboxParams;
    };

	[CONSTANTS.VERIFICATION.BASIS_SYMBOL]: string;
}

/**
 * A type that combines the original object with sandbox proxy properties.
 *
 * @template T - The type of the original object.
 */
export type SandboxProxy<T> = T & SandboxProxyProps<T>;


export type Metadata<T extends object> = {
	id: string;
	changes: Partial<T>;
	original: T;
	params: SandboxParams;
};
