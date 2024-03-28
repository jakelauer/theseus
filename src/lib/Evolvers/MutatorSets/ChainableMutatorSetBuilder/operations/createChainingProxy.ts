import { Theseus } from "@/Theseus";
import getTheseusLogger from "@Shared/Log/get-theseus-logger";
import type { SortaPromise } from "../../../Types/EvolverTypes";
import { v4 as uuidv4 } from "uuid";

type ProxyAction = "function" | "toJSON" | "property" | "chainTermination" | "chainHelper" | undefined;

type TTargetBase = { [key: string]: any };
export type TTargetChained<TTarget extends TTargetBase> = {
    [K in keyof TTarget]: TTarget[K] extends () => any ?
        (
            ...args: Parameters<TTarget[K]>
        ) => ReturnType<TTarget[K]> extends Promise<any> ? Promise<TTargetChained<TTarget>>
        :   TTargetChained<TTarget>
    :   TTarget[K];
} & {
    toJSON: any;
    finalForm: any;
    finalFormAsync: any;
    finally: any;
    using: any;
    then: any;
};

/**
 * ChainingProxy is a class that enables method chaining and queueing of operations on a proxied object. It
 * allows for the queueing of mutations and supports asynchronous operation handling, including Promises. This
 * functionality is particularly useful for managing sequences of operations that should be executed in a
 * specific order.
 */
class ChainingProxy<TTarget extends TTargetBase> {
    private proxyUuid: string;
    private log: any;
    private isFinalChainLink: boolean;
    private queueMutation: (selfPath: string, func: () => any, args: any[]) => SortaPromise<object>;
    private target: TTarget;

    /** Creates an instance of ChainingProxy. */
    constructor(
        private readonly params: {
            target: TTarget;
            observationId?: string;
            queueMutation: (selfPath: string, func: () => any, args: any[]) => SortaPromise<object>;
        },
    ) {
        this.proxyUuid = uuidv4();
        this.log = getTheseusLogger(`ChainingProxy-${this.proxyUuid}`);
        this.isFinalChainLink = false;
        this.queueMutation = params.queueMutation;
        this.target = params.target;
    }

    /** Sets the flag to indicate whether the current chain link is the final one. */
    private setChainTerminated(terminate: boolean) {
        this.log.verbose(terminate ? "[=== Chain end reached ===]" : "[=== Chain reset ===]");
        this.isFinalChainLink = terminate;
    }

    /** Handles the finalization of operations and resets the chain if necessary. */
    private finalizeAndReset(execResult: any) {
        const isAsync = execResult instanceof Promise;
        if (isAsync) {
            this.log.verbose("Promise detected, executing .finally operation asynchronously");
            void execResult.finally(() => this.setChainTerminated(false));
        } else {
            this.setChainTerminated(false);
        }

        this.log.verbose(`Returning ${isAsync ? "async" : "sync"} result of queued operations`, execResult);
        return execResult;
    }

    /** Handles the termination of the chain through specific properties. */
    private onChainEnd(prop: string) {
        this.log.verbose(`[=== Chain end reached ===] via "${prop}"`);
        this.setChainTerminated(true);
    }

    /** Processes a function call on the proxied object. */
    private handleFunctionCall(proxy: any, prop: string, target: any) {
        this.log.verbose(`Function "${prop}" called`);
        return (...args: any[]) => {
            const execResult = this.queueMutation(prop, target[prop], args);

            if (this.isFinalChainLink) {
                this.log.verbose(".finally mode active, returning result of queued operations", execResult);

                if (this.params.observationId) {
                    void Theseus.updateInstance(this.params.observationId, execResult);
                }

                return this.finalizeAndReset(execResult);
            }

            return proxy;
        };
    }

    /** Handles the toJSON operation to allow serialization of the proxied object. */
    private toJson(target: any) {
        this.log.verbose("toJSON called");
        return () => {
            const copy = { ...target };
            delete copy.chainingProxy; // Remove the circular reference when serializing
            return copy;
        };
    }

    /** Determines the action to be taken based on the property accessed on the proxy. */
    private determineAction(target: any, rawProp: string | symbol): ProxyAction {
        const prop = typeof rawProp === "symbol" ? rawProp.toString() : rawProp;

        let requestType: ProxyAction;

        this.log.debug("Determining action", { prop });

        if (prop === "toJSON") {
            requestType = "toJSON";
        } else if (typeof target[prop] === "function") {
            requestType = "function";
        } else if (prop in target) {
            requestType = "property";
        } else if (["finally", "finalForm", "finalFormAsync"].includes(prop)) {
            requestType = "chainTermination";
        } else if (["finally", "then"].includes(prop)) {
            requestType = "chainHelper";
        }

        return requestType;
    }

    /** Processes the action determined by determineAction. */
    private processAction(requestType: ProxyAction, proxy: any, target: any, prop: string) {
        let toReturn: any;

        switch (requestType) {
            case "function":
                toReturn = this.handleFunctionCall(proxy, prop, target);
                break;
            case "toJSON":
                toReturn = this.toJson(target);
                break;
            case "property":
                toReturn = target[prop];
                break;
            case "chainTermination":
                this.onChainEnd(prop);
                toReturn = proxy;
                break;
            case "chainHelper":
                this.log.trace(`Chain operation used: "${prop}"`);
                toReturn = proxy;
                break;
            default:
                this.log.error(`Property "${prop}" not found in target`);
                throw new Error(`Property "${prop}" not found in target`);
        }

        return toReturn;
    }

    /** Intercepts get operations on the proxy object to enable method chaining, queuing, and more. */
    private getProperty(proxy: any, target: any, rawProp: string | symbol) {
        this.log.verbose("Getting property", { rawProp });
        const prop = typeof rawProp === "symbol" ? rawProp.toString() : rawProp;

        const requestType = this.determineAction(target, rawProp);

        return this.processAction(requestType, proxy, target, prop);
    }

    /**
     * Creates a proxied instance of the target object with enhanced functionality for method chaining and
     * operation queuing.
     */
    public create(): TTargetChained<TTarget> {
        const proxy: any = new Proxy(this.target as any, {
            get: (target: any, rawProp: string | symbol) => this.getProperty(proxy, target, rawProp),
        });

        return proxy;
    }
}

/** Creates a chaining proxy for the provided target object. */
export function createChainingProxy<TTarget extends TTargetBase>(params: {
    target: TTarget;
    observationId?: string;
    queueMutation: (selfPath: string, func: () => any, args: any[]) => SortaPromise<object>;
}): TTargetChained<TTarget> {
    const chainingProxy = new ChainingProxy(params);
    return chainingProxy.create();
}
