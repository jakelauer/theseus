import { logLevels, type ValidLogLevels } from "./set-theseus-log-level";

const isBrowserContext = typeof window !== "undefined";
const logLevelFlagExists = (argv: string[]) => !isBrowserContext && argv.includes("--theseus-log-level");

export function determineLogLevel(argv: string[]): ValidLogLevels | undefined 
{
	if (logLevelFlagExists(argv)) 
	{
		const logLevelFlag = argv[argv.indexOf("--theseus-log-level") + 1];

		console.log(`Theseus log level flag detected: ${logLevelFlag}`);

		return logLevelFlag in logLevels ? logLevelFlag as ValidLogLevels : "silent";
	}
	return undefined;
}

export const logLevelFromFlag = determineLogLevel(process.argv);
