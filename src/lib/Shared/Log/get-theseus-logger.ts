import winston from "winston";

import { setTheseusLogLevel } from "@Shared/Log/set-theseus-log-level";
import winstonConfigBuilder from "@Shared/Log/winston-config-builder";
import { isTestMode } from "@Shared/Test/isTestMode";

const testMode = isTestMode();

setTheseusLogLevel(testMode ? "debug" : "verbose");

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

    Object.defineProperty(logger, "major", {
        get() {
            return (...args: Parameters<typeof logger.info>) => logger.log("major", ...args);
        },
    });

    return logger as TheseusLogger;
}

type TheseusLogger = winston.Logger & { major: winston.LeveledLogMethod };

/** Mock type for the logging library. */
export type MockLoggingLib = Pick<
    winston.Logger,
    "info" | "error" | "warn" | "debug" | "format" | "silly" | "verbose"
> & { major: winston.LeveledLogMethod };

export default getTheseusLogger;
