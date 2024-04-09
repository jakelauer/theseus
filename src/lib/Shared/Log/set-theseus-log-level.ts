import { allTransports } from "@Shared/Log/winston-config-builder";

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


let savedLevel: keyof typeof logLevels | "silent" = "silent";
const setAllTransportsLevel = (newLevel?: keyof typeof logLevels | "silent") => 
{
    // If the level is already set to the new level, do nothing
    if (savedLevel === newLevel) 
    {
        return;
    }
	
    // Use the new level if it is provided, otherwise use the saved level
    const level = newLevel ?? savedLevel;

    // Save the level for future reference
    savedLevel = level;

    // Set the level and silent flag for all transports
    for (const transport of allTransports) 
    {
        transport.level = level;
        transport.silent = level === "silent";
    }
};
	

/**
 * Set the log level for the specified transport.
 *
 * @param level The log level to set. Message with this level or higher will be logged. e.g. setting to "warn"
 *   will log "warn" and "error" messages.
 */

export const setTheseusLogLevel = (level?: keyof typeof logLevels | "silent") => 
{
    setAllTransportsLevel(level);
};
