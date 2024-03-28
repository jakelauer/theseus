import winston from "winston";

import { setTheseusLogLevel } from "@Shared/Log/set-theseus-log-level";
import winstonConfigBuilder from "@Shared/Log/winston-config-builder";
import { isTestMode } from "@Shared/Test/isTestMode";

const testMode = isTestMode();

setTheseusLogLevel(testMode ? "debug" : "major");

export type TheseusLogParams = Parameters<typeof winston.createLogger>[0];
const buildLogger = (label: string, params: TheseusLogParams = {}) =>
    winston.createLogger({
        ...winstonConfigBuilder(label).config,
        ...params,
    });

/**
 * Returns a logger with the given name.
 *
 * @param label - The name of the logger.
 * @param _mockLoggingLib - For testing purposes only. If provided, the mock library will be used instead of
 *   the real one.
 */
export function getTheseusLogger(
    label: string,
    params: TheseusLogParams = {},
    _mockLoggingLib?: (label: string) => MockLoggingLib,
): TheseusLogger {
    const logger: winston.Logger = (_mockLoggingLib?.(label) as any) ?? buildLogger(label, params);

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
                    return logger.log("debug", stack, ...args);
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
