import log, { LogLevelDesc } from "loglevel";

import { isTestMode } from "@Shared/Test/isTestMode";

interface TheseusLogLevelParams {
    level: LogLevelDesc;
    persist: boolean;
}

export const setTheseusLogLevel = (params?: Partial<TheseusLogLevelParams>) => {
    const argsWithDefaults: TheseusLogLevelParams = {
        level: isTestMode() ? "TRACE" : "SILENT",
        persist: false,
        ...params,
    };

    console.log(`Setting Theseus log level to ${argsWithDefaults.level}`);

    log.setLevel(argsWithDefaults.level, argsWithDefaults.persist);
};

setTheseusLogLevel();

export default log;
