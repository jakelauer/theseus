import { getTheseusLogger } from "theseus-logger";
import { ProxyActions, ProxyActionType } from "../proxy-actions.js";
import type { ProxyActionMapParameters } from "../proxy-action-map.js";
import type { ChainingProxyManager } from "../chaining-proxy-manager.js";

const log = getTheseusLogger("chain-termination-proxy-action");

type PropName = string;
type ProcessReturnsProxy = boolean;

/**
 * Signifies the end of a chain of actions, and returns either the resulting data, a promise of the data, or the proxy itself
 */
export class ChainTerminationAction extends ProxyActions 
{
	public override type: ProxyActionType = ProxyActionType.chainTermination;
	private readonly matchAgainstProps = new Map<PropName, ProcessReturnsProxy>([
		["end", false],
		["endAsync", false],
		["lastly", true],
		["lastlyAsync", true],
	]);

	public override runTest({ prop }: ProxyActionMapParameters): boolean 
	{
		const propMatches = this.matchAgainstProps.has(prop);

		return propMatches;
	}

	/**
	 * If the prop matches a chainer, returns the proxy to allow further chaining
	 */
	private tryGetProxyForChainers({
		prop, proxyManager, proxy, 
	}: ProxyActionMapParameters) 
	{
		const processReturnsProxy = this.matchAgainstProps.get(prop) ?? false;

		proxyManager.onChainEnd(prop);

		if (processReturnsProxy) 
		{
			return proxy;
		}
	}

	/**
	 * Returns the result of the chain, as a promise if the chain was async, or the result itself if it was sync.
	 */
	private getReturnableResult(proxyManager: ChainingProxyManager<any>) 
	{
		return  proxyManager.queue.asyncEncountered ?
            	() => (proxyManager.queue.queue as Promise<any>).then(() => proxyManager.params.target.endAsync())
            	:   () => proxyManager.params.target.end();
	}

	public process(params: ProxyActionMapParameters) 
	{
		const { prop, proxyManager } = params;

		const toReturn = this.tryGetProxyForChainers(params) ??
            this.getReturnableResult(proxyManager);

		const asyncLabel = proxyManager.queue.asyncEncountered ? "🕐ASYNC" : "";

		log.verbose(`[${prop}${asyncLabel}] processed`);

		return toReturn;
	}
}
