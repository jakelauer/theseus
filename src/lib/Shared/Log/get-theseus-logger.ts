import winston from "winston";

import { setTheseusLogLevel } from "@Shared/Log/set-theseus-log-level";
import winstonConfigBuilder from "@Shared/Log/winston-config-builder";
import { isTestMode } from "@Shared/Test/isTestMode";

const testMode = isTestMode();

setTheseusLogLevel(testMode ? "debug" : "major");

const rootLogger = winston.createLogger({
    ...winstonConfigBuilder().config,
});

export type TheseusLogParams = Parameters<typeof winston.createLogger>[0];
const buildLogger = (label: string) => rootLogger.child({ label });

/**
 * Returns a logger with the given name.
 *
 * @param label - The name of the logger.
 * @param _mockLoggingLib - For testing purposes only. If provided, the mock library will be used instead of
 *   the real one.
 */
export function getTheseusLogger(
    label: string,
    _mockLoggingLib?: (label: string) => MockLoggingLib,
): TheseusLogger {
    const logger: winston.Logger = (_mockLoggingLib?.(label) as any) ?? buildLogger(label);

    Object.defineProperties(logger, {
        major: {
            get() {
                return (...args: Parameters<typeof logger.info>) => logger.log("major", ...args);
            },
        },
        trace: {
            get() {
                return (message: string, ...args: []) => {
                    const stack = new Error(message).stack?.replace(/Error: /gi, "Trace: ");
                    const filtered = stack
                        ?.split("\n")
                        .filter((line) => !line.includes("theseus-logger"))
                        .join("\n");
                    return logger.log("debug", filtered, ...args);
                };
            },
        },
    });

    return logger as TheseusLogger;
}

type TheseusLogLevelMethods = { major: winston.LeveledLogMethod; trace: winston.LeveledLogMethod };

type TheseusLogger = winston.Logger & TheseusLogLevelMethods;

/** Mock type for the logging library. */
export type MockLoggingLib = Pick<
    winston.Logger,
    "info" | "error" | "warn" | "debug" | "format" | "silly" | "verbose"
> &
    TheseusLogLevelMethods;

export default getTheseusLogger;
