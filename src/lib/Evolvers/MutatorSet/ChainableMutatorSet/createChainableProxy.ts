import log from "@Shared/Log/log";
import { Func } from "@Types/Modifiers";

export function createChainableProxy<T>(params: {
    target: T;
    queueMutatorExecution: (selfPath: string, func: Func, args: any[]) => any;
    isAsyncEncountered: () => boolean;
    setFinallyMode: (mode: boolean) => void;
    getFinallyMode: () => boolean;
}): T {
    const { queueMutatorExecution, isAsyncEncountered, getFinallyMode, setFinallyMode, target } =
        params;

    const proxy: any = new Proxy(target as any, {
        get: (target, prop: string) => {
            log.debug(`[Proxy] Getting property "${prop}"`);
            if (prop === "finally") {
                log.debug(`[Proxy] .finally encountered, switching to finally mode`);
                setFinallyMode(true);
                return proxy;
            }

            if (typeof target[prop] === "function") {
                return (...args: any[]) => {
                    log.debug(`[Proxy] Executing function "${prop}" with: `, { args });
                    const execResult = queueMutatorExecution(prop, target[prop], args);

                    if (getFinallyMode()) {
                        log.debug(
                            `[Proxy] .finally mode active, returning result of queued operations`,
                            execResult,
                        );
                        return execResult;
                    }

                    const chainer = isAsyncEncountered() ? "then" : "and";
                    log.debug(`[Proxy] Returning chainer "${chainer}" for function "${prop}"`);

                    return {
                        [chainer]: proxy,
                    };
                };
            } else {
                return target[prop];
            }
        },
    });

    return proxy;
}
