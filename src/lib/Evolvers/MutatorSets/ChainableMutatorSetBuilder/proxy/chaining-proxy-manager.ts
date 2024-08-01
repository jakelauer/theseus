import { getTheseusLogger } from "theseus-logger";
import type { SortaPromise } from "../../../Types/EvolverTypes.js";
import type { ChainableMutatorSetBuilder } from "../ChainableMutatorSetBuilder.js";
import type { ChainableMutatorQueue } from "../ChainableMutatorQueue.js";
import { ProxyActionMap } from "./proxy-action-map.js";
import type { SandboxableParams } from "../../../Types/SandboxParams.js";

/**
 * ChainingProxy is a class that enables method chaining and queueing of operations on a proxied object. It
 * allows for the queueing of mutations and supports asynchronous operation handling, including Promises. This
 * functionality is particularly useful for managing sequences of operations that should be executed in a
 * specific order.
 */
export class ChainingProxyManager<TTarget extends ChainableMutatorSetBuilder<any, any, any>> 
{
	private static proxyCount = 0;
	private proxyIndex: string;
	private log: any;
	public isFinalChainLink: boolean;
	public readonly queue: ChainableMutatorQueue<any, any>;
	private target: TTarget;

	/** Creates an instance of ChainingProxy. */
	constructor(
        public readonly params: {
            target: TTarget;
            observationId?: string;
			queue: ChainableMutatorQueue<any, any>;
			sandboxableOptions?: SandboxableParams;
        },
	) 
	{
		this.proxyIndex = ChainingProxyManager.proxyCount.toString();
		this.log = getTheseusLogger(`chaining-proxy-manager-${this.proxyIndex}`);
		this.isFinalChainLink = false;
		this.queue = params.queue;
		this.target = params.target;

		ChainingProxyManager.proxyCount++;
	}

	/** Sets the flag to indicate whether the current chain link is the final one. */
	private setChainTerminated(terminate: boolean) 
	{
		this.log.verbose(terminate ? "[=== Chain terminated ===]" : "[=== Chain reset ===]");
		this.isFinalChainLink = terminate;
	}

	/** Handles the finalization of operations and resets the chain if necessary. */
	public finalizeAndReset(execResult: any): SortaPromise<object> 
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

		this.log.debug(`Returning ${isAsync ? "async" : "sync"} result of queued operations`);

		return execResult;
	}

	/** Handles the termination of the chain through specific properties. */
	public onChainEnd(prop: string) 
	{
		this.log.verbose(`[=== Chain end detected ===] via "${prop}"`);
		this.setChainTerminated(true);
	}

	/**
     * Resets the chain if the the property requested was a result property, indicating that the chain is
     * terminated.
     */
	private resetIfResultReturned(prop: string, result: any) 
	{
		if (prop === "end" || prop === "endAsync") 
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

	private isBuiltInProp(prop: string) 
	{
		const builtInProps = ["constructor", "prototype", "__proto__"];
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

		const requestType = ProxyActionMap.determineAction({
			target,
			prop,
			proxy,
			proxyManager: this,
			queue: this.queue,
		});

		const result = ProxyActionMap.process(
			{
				target,
				prop,
				proxy,
				proxyManager: this,
				queue: this.queue,
			},
			requestType,
		);

		this.log.verbose(`[${prop}] Returning result`);

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
	sandboxableOptions?: SandboxableParams;
}): TTarget 
{
	const chainingProxy = new ChainingProxyManager(params);
	return chainingProxy.create();
}
