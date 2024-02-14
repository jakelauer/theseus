import log from "@Shared/Log/log";
import { Func } from "@Types/Modifiers";

export function createChainableProxy<T>(params: {
    target: T;
    queueMutatorExecution: (selfPath: string, func: Func, args: any[]) => any;
    setFinallyMode: (mode: boolean) => void;
    getFinallyMode: () => boolean;
}): T {
    const { queueMutatorExecution, getFinallyMode, setFinallyMode, target } = params;

    const proxy: any = new Proxy(target as any, {
        get: function (target: any, rawProp: string | symbol) {
            const prop = typeof rawProp === "symbol" ? rawProp.toString() : rawProp;
            log.debug(`[Proxy] Getting property "${prop}"`);

            if (["finally", "finalForm", "finalFormAsync"].includes(prop)) {
                log.debug(`[Proxy] Setting finally mode to true for "${prop}"`);

                setFinallyMode(true);
            }

            if (["finally", "then"].includes(prop)) {
                log.debug(`[Proxy] Returning proxy for chaining operator "${prop}"`);

                return proxy;
            }

            if (typeof target[prop] === "function") {
                return (...args: any[]) => {
                    log.debug(`[Proxy] Executing function "${prop}" with: `, { args });
                    const execResult = queueMutatorExecution(prop, target[prop], args);

                    log.debug(`[Proxy] queueMutatorExecution result: `, execResult);

                    if (getFinallyMode()) {
                        log.debug(
                            `[Proxy] .finally mode active, returning result of queued operations`,
                            execResult,
                        );
                        return execResult;
                    }

                    return proxy;
                };
            } else if (prop in target) {
                return target[prop];
            } else {
                log.error(`[Proxy] Property "${prop}" not found in target`);
                throw new Error(`Property "${prop}" not found in target`);
            }
        },
    });

    return proxy;
}
