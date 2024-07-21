import { logLevels, type ValidLogLevels } from "./log-levels.js";

const argNames = ["theseus-log-level", "theseus-log-filter"] as const;

const argDictTypes = {
	"theseus-log-level": "silent" as ValidLogLevels,
	"theseus-log-filter": undefined as RegExp | undefined,
} as const;

// Create a mapped type to remove readonly and define ArgDict
type ArgDict = {
    -readonly [K in keyof typeof argDictTypes]: (typeof argDictTypes)[K];
};

const isBrowserContext = typeof window !== "undefined";

function stringToRegExp(input: string) 
{
	const match = input.match(/^\/(.*?)\/([gimsuy]*)$/);
	if (match) 
	{
		const pattern = match[1];
		const flags = match[2];
		return new RegExp(pattern, flags);
	}
	else 
	{
		return new RegExp(input);
	}
}

const getArgValueDictionary = (argv: string[]) =>
	argNames.reduce((acc, flagName) => 
	{
		const flagIndex = argv.indexOf(`--${flagName}`);
		if (flagIndex !== -1) 
		{
			let result = argv[flagIndex + 1] as ArgDict[typeof flagName];
			switch (flagName) 
			{
				case "theseus-log-level":
					if (!((argv[flagIndex + 1] as ValidLogLevels) in logLevels)) 
					{
						throw new Error(
							`Invalid log level: ${argv[flagIndex + 1]}. Must be one of ${Object.keys(logLevels).join(", ")}.`,
						);
					}

					if (isBrowserContext) 
					{
						throw new Error("Log level flag is not supported in browser context");
					}
					break;
				case "theseus-log-filter":
					try 
					{
						result = new RegExp(stringToRegExp(argv[flagIndex + 1]));
					}
					catch (_e) 
					{
						throw new Error(
							`Invalid log filter: ${argv[flagIndex + 1]}. Must be a valid regular expression.`,
						);
					}
					break;
				default:
					break;
			}

			// @ts-expect-error - This is a safe cast because we've already checked the value is in the logLevels object
			acc[flagName] = result;
		}
		return acc;
	}, {} as Partial<ArgDict>);

export const theseusArgs = getArgValueDictionary(process.argv);
