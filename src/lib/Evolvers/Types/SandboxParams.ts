import type { SandboxParams } from "theseus-sandbox";

export interface SandboxableParams {
	/**
	 * Configuration for sandboxing the data object.
	 */
	sandbox?: Partial<SandboxParams>;
	frost?: {
		/**
		 * Whether to disable automatic frosting of the provided data object. By default, the data object will be
		 * automatically frosted when passed to an Evolver and the output data will remain frosty in order to
		 * provide maximal immutability. Manually defrosting the resulting data object is still possible.
		 * 
		 * If `true`, the data object will not be automatically frosted, and immutability will not be guaranteed.
		 * The returned data object's frost status will be the same as the input data object's frost status. 
		 * 
		 * @default false
		 */
		manual?: boolean;
	}
}
