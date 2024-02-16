import log, { LogLevelDesc } from "loglevel";
import prefix from "loglevel-plugin-prefix";

import { isTestMode } from "@Shared/Test/isTestMode";

export const resetTheseusLogLevel = () => {
    setTheseusLogLevel();
};

/**
 * @param level As a string, like 'error' (case-insensitive) or as a number from 0 to 5 (or as
 *   log.levels. values)
 * @param persist Where possible the log level will be persisted. LocalStorage will be used if
 *   available, falling back to cookies if not. If neither is available in the current environment
 *   (i.e. in Node), or if you pass false as the optional 'persist' second argument, persistence
 *   will be skipped.
 * @theseus jlauer - I stole this comment from loglevel's source code. It's a good explanation of what this function does.
 *
 * This disables all logging below the given level, so that after a log.setLevel("warn") call log.warn("something")
 * or log.error("something") will output messages, but log.info("something") will not.
 */
export const setTheseusLogLevel = (level?: LogLevelDesc, persist = false) => {
    // If level is not provided, set it to "debug" in test mode and "info" otherwise.
    // I know we're reassigning a parameter here, but keeping the variable name as `level`
    // makes the code more readable.
    level = level ?? (isTestMode() ? "debug" : "info");

    console.log(`Setting Theseus log level to ${level}`);

    prefix.reg(log);
    prefix.apply(log, {
        template: "[%t] {{%n}} %l:",
        format(level, _, timestamp) {
            return `[${timestamp}] [${level}]`;
        },
        timestampFormatter: function (date) {
            const hours = date.getHours().toString().padStart(2, "0");
            const minutes = date.getMinutes().toString().padStart(2, "0");
            const seconds = date.getSeconds().toString().padStart(2, "0");
            const milliseconds = date.getMilliseconds().toString().padStart(3, "0");

            return `${hours}:${minutes}:${seconds}.${milliseconds}`;
        },
    });

    log.setLevel(level, persist);
};

setTheseusLogLevel();

/**
 * Returns a logger with the given name.
 *
 * @param name - The name of the logger.
 * @param _mockLoggingLib - For testing purposes only. If provided, the mock library will be used
 *   instead of the real one.
 */
export default function getTheseusLogger(name: string, _mockLoggingLib?: MockLoggingLib) {
    const logger = _mockLoggingLib?.getLogger(name) ?? log.getLogger(name);
    // configure logger if necessary
    return logger;
}

/** Mock type for the logging library. */
export type MockLoggingLib = Pick<typeof log, "getLogger">;
