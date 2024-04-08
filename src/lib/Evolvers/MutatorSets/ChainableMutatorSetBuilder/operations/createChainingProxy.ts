import { Theseus } from "@/Theseus";
import getTheseusLogger from "@Shared/Log/get-theseus-logger";
import type { SortaPromise } from "../../../Types/EvolverTypes";
import type { ChainableMutatorSetBuilder } from "../ChainableMutatorSetBuilder";
import { enumValToFlagNames } from "../../../../Shared/Object/Flags";
import type { ChainableMutatorQueue } from "./ChainableMutatorQueue";

enum ProxyAction {
    none = 0 << 0,
    function = 1 << 0,
    mutator = 1 << 1,
    toJSON = 1 << 2,
    property = 1 << 3,
    chainTermination = 1 << 4,
    chainHelper = 1 << 5,
    updateData = 1 << 6,
}

/**
 * ChainingProxy is a class that enables method chaining and queueing of operations on a proxied object. It
 * allows for the queueing of mutations and supports asynchronous operation handling, including Promises. This
 * functionality is particularly useful for managing sequences of operations that should be executed in a
 * specific order.
 */
class ChainingProxy<TTarget extends ChainableMutatorSetBuilder<any, any, any>> 
{
    private static proxyCount = 0;
    private proxyIndex: string;
    private log: any;
    private isFinalChainLink: boolean;
    private queue: ChainableMutatorQueue<any, any>;
    private target: TTarget;

    /** Creates an instance of ChainingProxy. */
    constructor(
        private readonly params: {
            target: TTarget;
            observationId?: string;
            queue: ChainableMutatorQueue<any, any>;
        },
    ) 
    {
        this.proxyIndex = ChainingProxy.proxyCount.toString();
        this.log = getTheseusLogger(`ChainingProxy-${this.proxyIndex}`);
        this.isFinalChainLink = false;
        this.queue = params.queue;
        this.target = params.target;

        ChainingProxy.proxyCount++;
    }

    /** Sets the flag to indicate whether the current chain link is the final one. */
    private setChainTerminated(terminate: boolean) 
    {
        this.log.verbose(terminate ? "[=== Chain terminated ===]" : "[=== Chain reset ===]");
        this.isFinalChainLink = terminate;
    }

    /** Handles the finalization of operations and resets the chain if necessary. */
    private finalizeAndReset(execResult: any): SortaPromise<object> 
    {
        const isAsync = execResult instanceof Promise;
        if (isAsync) 
        {
            this.log.verbose("Promise detected, executing .finally operation asynchronously");
            void execResult.finally(() => this.setChainTerminated(false));
        }
        else 
        {
            this.setChainTerminated(false);
        }

        this.log.trace(`Returning ${isAsync ? "async" : "sync"} result of queued operations`, execResult);
        return execResult;
    }

    /** Handles the termination of the chain through specific properties. */
    private onChainEnd(prop: string) 
    {
        this.log.verbose(`[=== Chain end detected ===] via "${prop}"`);
        this.setChainTerminated(true);
    }

    /** Processes a function call on the proxied object. */
    private handleFunctionCall(prop: string, target: any) 
    {
        this.log.verbose(`Function "${prop}" called`);
        return target[prop];
    }

    /** Processes a function call on the proxied object. */
    private handleMutatorCall(proxy: any, prop: string, target: any) 
    {
        return (...args: any[]) => 
        {
            this.log.verbose(`Mutator "${prop}" requested`);
            const execResult = this.queue.queueMutation(prop, target.fixedMutators[prop], args);

            if (this.isFinalChainLink) 
            {
                if (this.params.observationId) 
                {
                    void Theseus.updateInstance(this.params.observationId, execResult);
                }
                this.log.verbose(`.lastly mode active, returning result of queued operations after prop ${prop}`, execResult);

                return this.finalizeAndReset(execResult);
            }

            return proxy;
        };
    }

    /** Handles the toJSON operation to allow serialization of the proxied object. */
    private toJson(target: any) 
    {
        this.log.verbose("toJSON called");
        return () => 
        {
            const copy = { ...target };
            delete copy.chainingProxy; // Remove the circular reference when serializing
            return copy;
        };
    }

    /**
	 * Resets the chain if the the property requeseted was a result property, indicating that the chain is
	 * terminated.
	 */
    private resetIfResultReturned(prop: string, result: any)
    {
        if (prop === "result" || prop === "resultAsync") 
        {
            if (result instanceof Promise)
            {
                this.log.verbose("Result is a promise; skipping reset.", {
                    isFinalChainLink: this.isFinalChainLink,
                });
            }
            else 
            {
                this.setChainTerminated(false);
            }
        }
    }

    /** Determines the action to be taken based on the property accessed on the proxy. */
    private determineAction(target: any, prop: string): ProxyAction 
    {
        const propActions = {
            toJSON: ProxyAction.toJSON,
            lastly: ProxyAction.chainTermination | ProxyAction.chainHelper,
            and: ProxyAction.chainHelper,
            setData: ProxyAction.updateData,
        } as const;

        // Include properties leading to chain termination
        const chainTerminationProps = new Set(["result", "resultAsync"]);

        let requestType = ProxyAction.none; // Assuming ProxyAction is already defined somewhere in your code

        if (chainTerminationProps.has(prop)) 
        {
            requestType = ProxyAction.chainTermination;
        }
        else if (prop in propActions) 
        {
            requestType = propActions[prop as keyof typeof propActions];
        }
        else if (typeof target[prop] === "function") 
        {
            requestType = ProxyAction.function;
        }
        else if (typeof target.fixedMutators?.[prop] === "function") 
        {
            requestType = ProxyAction.mutator;
        }
        else if (prop in target) 
        {
            requestType = ProxyAction.property;
        }

        const enumVal = enumValToFlagNames(requestType, ProxyAction);

        this.log.debug(`Action determined for property "${prop}": ${enumVal}`);

        return requestType;
    }

    /** Processes the action determined by determineAction. */
    private processAction(requestType: ProxyAction, proxy: any, target: any, prop: string) 
    {
        let toReturn: any = undefined; // Initial value is undefined to indicate "not set"

        const enumVal = enumValToFlagNames(requestType, ProxyAction);
        this.log.verbose(`Processing action "${enumVal}" for property "${prop}"`, {
            propsInTarget: Object.keys(target),
            prop,
        });

        // Using bitwise AND (&) to check for each action.
        if (requestType & ProxyAction.function) 
        {
            toReturn = this.handleFunctionCall(prop, target);
        }

        if (requestType & ProxyAction.mutator) 
        {
            // Apply some logic to combine results if needed, for example:
            toReturn = this.handleMutatorCall(proxy, prop, target) || toReturn;
        }

        if (requestType & ProxyAction.toJSON) 
        {
            toReturn = this.toJson(target);
        }

        if (requestType & ProxyAction.property) 
        {
            toReturn = target[prop];
        }

        if (requestType & ProxyAction.chainTermination) 
        {
            this.onChainEnd(prop);
            toReturn = this.queue.asyncEncountered ? this.queue.queue : this.target.result;
            this.log.verbose(`Returning result for property "${prop}". Async: ${this.queue.asyncEncountered}`, {
                toReturn,
            });
        }

        if (requestType & ProxyAction.chainHelper) 
        {
            toReturn = proxy;
        }

        if (requestType & ProxyAction.updateData) 
        {
            toReturn = this.params.target.setData;
        }


        // If after checking all bits toReturn is still undefined, it means no valid action was matched.
        if (typeof toReturn === "undefined") 
        {
            this.log.trace(`Property or action "${prop}" not found in target or not supported`, { prop });
            throw new Error(`Property or action "${prop}" not found in target or not supported`);
        }

        this.log.verbose(`Action "${enumVal}" processed for property "${prop}"`);

        return toReturn;
    }

    private isBuiltInProp(prop: string)
    {
        const builtInProps = [
            "constructor",
            "prototype",
            "__proto__",
        ];
        return builtInProps.includes(prop);
    }

    /** Intercepts get operations on the proxy object to enable method chaining, queuing, and more. */
    private getProperty(proxy: any, target: any, prop: string | symbol) 
    {
        if (typeof prop === "symbol")
        {
            return target[prop];
        }

        if (this.isBuiltInProp(prop))
        {
            return target[prop];
        }

        const requestType = this.determineAction(target, prop);

        const result = this.processAction(requestType, proxy, target, prop);

        this.log.verbose(`Returning result for property "${prop}"`);

        this.resetIfResultReturned(prop, result);

        return result;
    }

    /**
     * Creates a proxied instance of the target object with enhanced functionality for method chaining and
     * operation queuing.
     */
    public create(): TTarget 
    {
        const proxy: any = new Proxy(this.target as any, {
            get: (target: any, rawProp: string | symbol) => this.getProperty(proxy, target, rawProp),
        });

        return proxy;
    }
}

/** Creates a chaining proxy for the provided target object. */
export function createChainingProxy<TTarget extends ChainableMutatorSetBuilder<any, any, any>>(params: {
    target: TTarget;
    observationId?: string;
    queue: ChainableMutatorQueue<any, any>;
}): TTarget 
{
    const chainingProxy = new ChainingProxy(params);
    return chainingProxy.create();
}
