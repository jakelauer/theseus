import getTheseusLogger from "@Shared/Log/getTheseusLogger";

const log = getTheseusLogger("Queue");

export function createChainingProxy<T>(params: {
    target: T;
    queueMutation: (selfPath: string, func: () => any, args: any[]) => any;
}): T {
    const { queueMutation, target } = params;

    let isFinalChainLink = false;

    const proxy: any = new Proxy(target as any, {
        get: function (target: any, rawProp: string | symbol) {
            // Ensure that prop is a string
            const prop = typeof rawProp === "symbol" ? rawProp.toString() : rawProp;

            // These properties always indicate the end of the chain has been reached
            if (["finally", "finalForm", "finalFormAsync"].includes(prop)) {
                log.debug(`[Proxy] [=== Chain end reached ===] via "${prop}"`);

                isFinalChainLink = true;
            }

            // These properties are used to chain operations
            if (["finally", "then"].includes(prop)) {
                return proxy;
            }

            if (typeof target[prop] === "function") {
                return (...args: any[]) => {
                    const execResult = queueMutation(prop, target[prop], args);

                    if (isFinalChainLink) {
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
