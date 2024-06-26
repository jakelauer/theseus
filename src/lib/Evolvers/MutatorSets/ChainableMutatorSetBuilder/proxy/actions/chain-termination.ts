import { getTheseusLogger } from "@/lib/Shared";
import { ProxyActions, ProxyActionType } from "../proxy-actions";
import type { ProxyActionMapParameters } from "../proxy-action-map";

const log = getTheseusLogger("chain-termination-proxy-action");

type PropName = string;
type ProcessReturnsProxy = boolean;

export class ChainTerminationAction extends ProxyActions
{
	public override type: ProxyActionType = ProxyActionType.chainTermination;
	private readonly matchAgainstProps = new Map<PropName, ProcessReturnsProxy>([
		["end", false],
		["endAsync", false],
		["lastly", true],
	]);

	public override runTest({ prop }: ProxyActionMapParameters): boolean 
	{
		const propMatches = this.matchAgainstProps.has(prop);

		return propMatches;
	}
	
	public process({
		prop, proxyManager, proxy, 
	}: ProxyActionMapParameters) 
	{
		const processReturnsProxy = this.matchAgainstProps.get(prop) ?? false;

		proxyManager.onChainEnd(prop);

		if (processReturnsProxy)
		{
			return proxy;
		}

		const toReturn = proxyManager.queue.asyncEncountered 
			? () => proxyManager.queue.queue
			: () => proxyManager.params.target.end();

		const asyncLabel = proxyManager.queue.asyncEncountered ? "🕐ASYNC" : "";

		log.verbose(`[${prop}${asyncLabel}] processed`);

		return toReturn;
	}
}
