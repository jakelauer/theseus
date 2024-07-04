export const logLevels = {
	error: 0,
	warn: 10,
	info: 20,
	major: 30,
	http: 40,
	verbose: 50,
	debug: 60,
	trace: 60,
	silly: 80,
} as const;

export type ValidLogLevels = keyof typeof logLevels | "silent";

export const DEFAULT_LOG_LEVEL: ValidLogLevels = "warn";
