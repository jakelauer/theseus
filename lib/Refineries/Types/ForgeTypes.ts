import type { Immutable } from "./RefineryTypes";

/**
 * The required shape of a Forge. Forges must be a function which is passed an object with one key,
 * which is `TParamName`, and a value of type `TData`. They may additionally specify any further arguments
 * as required by the functionality. They must return some type other than TData.
 */
export type Forge<TForgeableData, TPropName extends Immutable<string>> = (
    input: { [key in TPropName]: TForgeableData },
    ...args: any[]
) => any;
