import { theseusTransports } from "@Shared/Log/winston-config-builder";

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

/**
 * Set the log level for the specified transport.
 *
 * @param level The log level to set. Message with this level or higher will be logged. e.g. setting to "warn"
 *   will log "warn" and "error" messages.
 */

export const setTheseusLogLevel = (level: keyof typeof logLevels | "silent") => {
    if (level === "silent") {
        theseusTransports.console.silent = true;
    } else {
        theseusTransports.console.level = level;
    }
};
