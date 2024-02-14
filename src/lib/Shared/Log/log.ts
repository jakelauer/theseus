import log, { LogLevelDesc } from "loglevel";
import prefix from "loglevel-plugin-prefix";

interface TheseusLogLevelParams {
    level: LogLevelDesc;
    persist: boolean;
}

export const resetTheseusLogLevel = () => {
    setTheseusLogLevel();
};

export const setTheseusLogLevel = (params?: Partial<TheseusLogLevelParams>) => {
    const argsWithDefaults: TheseusLogLevelParams = {
        level: "silent",
        persist: false,
        ...params,
    };

    console.log(`Setting Theseus log level to ${argsWithDefaults.level}`);

    prefix.reg(log);
    prefix.apply(log, {
        template: "[%t] %l:",
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

    log.setLevel(argsWithDefaults.level, argsWithDefaults.persist);
};

setTheseusLogLevel();

export default log;
