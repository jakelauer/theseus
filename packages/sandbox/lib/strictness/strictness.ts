import { getTheseusLogger } from "theseus-logger";

export interface StrictnessOptions {
    /**
     * The mode to use when defrosting the object.
     * Options:
     * - "loose" (default): Will not throw an error if the object is not a frost object.
     * - "strict": Will throw an error if the object is not a frost object.
     */
    strict?: boolean | "warn";
}

type ErrorParams = Parameters<typeof Error>;
type WarnParams = Parameters<typeof console.warn>;

const log = getTheseusLogger("strict");

export const fail = (opts: StrictnessOptions | undefined, ...args: ErrorParams | WarnParams) => 
{
	const [message, ...rest] = args;

	switch (opts?.strict ?? false) 
	{
		case "warn":
			log.warn(message, ...rest);
			break;
		case true:
			if (rest.length > 0) 
			{
				log.error(message, ...rest);
			}
			throw new Error(message);
		default:
			log.debug(message, ...rest);
			break;
	}
};
