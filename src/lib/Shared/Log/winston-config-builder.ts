import * as winston from "winston";

import { logLevels } from "@Shared/Log/set-theseus-log-level";
import { stringifier } from "@Shared/Log/stringifier";

const { format, addColors } = winston;
const { combine, colorize, label, timestamp, printf, errors, splat, prettyPrint, json } = format;

export const theseusLogFormat = (loggerLabel?: string) =>
    combine(
        errors({ stack: true }),
        colorize({ all: true }),
        label({ label: loggerLabel }),
        splat(),
        json({ space: 2, circularValue: undefined }),
        prettyPrint(),
        timestamp({ format: "HH:MM:SS:ss.sss" }),
        printf((info) => {
            const { label, level, timestamp, message, ...args } = info;
            const argsAsString = stringifier(args)
                .split("\n")
                .map((line) => `|  ${line}`)
                .join("\n");
            const rest = Object.keys(args).length ? `\n${argsAsString}` : "";
            return `${timestamp} ${level} :: ${message} ⸨${label}⸩${rest}`;
        }),
    );

addColors({
    info: "gray", // fontStyle color
    major: "bold white",
    warn: "italic yellow",
    error: "bold red",
    debug: "blue",
    silly: "magenta",
});

export const theseusTransports = {
    console: new winston.transports.Console(),
};

theseusTransports.console.level = "debug";

const devMode = process.env.NODE_ENV === "development";
export default (label: string) => ({
    theseusTransports,
    config: {
        levels: logLevels,
        format: theseusLogFormat(label),
        exitOnError: false,
        transports: [theseusTransports.console],
        level: devMode ? "info" : "major",
    } as winston.LoggerOptions,
});
