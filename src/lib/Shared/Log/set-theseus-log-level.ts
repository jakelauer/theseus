import { allTransports } from "@Shared/Log/winston-config-builder";
import { type ValidLogLevels, DEFAULT_LOG_LEVEL } from "./log-levels";

let savedLevel: ValidLogLevels;
const setAllTransportsLevel = (newLevel?: ValidLogLevels) => 
{
	let changed = false;

	// Use the new level if it is provided, otherwise use the saved level
	const level = newLevel ?? savedLevel;

	// Save the level for future reference
	savedLevel = level;

	// Set the level and silent flag for all transports
	for (const transport of allTransports) 
	{
		if (level !== transport.level)
		{
			transport.level = level;
			changed = true;
		}

		if (level === "silent" && !transport.silent)
		{
			transport.silent = level === "silent";
			changed = true;
		}
	}

	return changed;
};
	

/**
 * Set the log level for the specified transport.
 *
 * @param level The log level to set. Message with this level or higher will be logged. e.g. setting to "warn"
 *   will log "warn" and "error" messages.
 */

let lastLogLevel: ValidLogLevels = DEFAULT_LOG_LEVEL;
export const setTheseusLogLevel = (level: ValidLogLevels = lastLogLevel) => 
{
	lastLogLevel = level;

	const changed = setAllTransportsLevel(level);

	if (changed)
	{
		console.log("Set Theseus log level to", level); // eslint-disable-line no-console
	}
};
