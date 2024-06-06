import { v4 as uuidv4 } from "uuid";
import { CONSTANTS } from "../constants";

type SandboxMode = "copy" | "modify";

type SandboxParams = {
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
    [CONSTANTS.PROP_PREFIX]: {
        /**
         * A unique identifier for the sandbox instance.
         */
        id: string;
        /**
         * A record of changes made to the sandbox proxy.
         */
        changes: Record<string | symbol, any>;
        /**
         * The original object being proxied.
         */
        original: T;

		params: SandboxParams;
    };
}

/**
 * A type that combines the original object with sandbox proxy properties.
 *
 * @template T - The type of the original object.
 */
export type SandboxProxy<T> = T & SandboxProxyProps<T>;

/**
 * Creates a sandbox proxy for the given object, allowing changes to be tracked
 * without modifying the original object.
 *
 * @template T - The type of the original object.
 * @param {T} originalObject - The object to create a sandbox proxy for.
 * @returns {T} - The sandbox proxy object.
 */
export function sandbox<T extends object>(originalObject: T, _params?: Partial<SandboxParams>): T 
{
	const changes: Record<string | symbol, any> = {};

	const params: SandboxParams = {
		mode: "modify",
		..._params,
	};
	
	const proxy = new Proxy<T>(originalObject, {
		get(target, prop) 
		{
			if (prop in changes) 
			{
				return changes[prop];
			}
			return target[prop];
		},
		set(_target, prop, value) 
		{
			changes[prop] = value;
			return true;
		},
		deleteProperty(_target, prop) 
		{
			changes[prop] = undefined;
			return true;
		},
	});

	const asSandboxProxy = proxy as SandboxProxy<T>;

	asSandboxProxy[CONSTANTS.PROP_PREFIX] = {
		id: uuidv4(),
		changes: changes,
		original: originalObject,
		params,
	};

	return proxy as T;
}

/**
 * Determines if the given object is a sandbox proxy.
 *
 * @template T - The type of the object.
 * @param {T} obj - The object to check.
 * @returns {obj is SandboxProxy<T>} - True if the object is a sandbox proxy, false otherwise.
 */
export function isSandboxProxy<T extends object>(obj: T): obj is SandboxProxy<T> 
{
	return !!(obj as any)[CONSTANTS.PROP_PREFIX];
}
