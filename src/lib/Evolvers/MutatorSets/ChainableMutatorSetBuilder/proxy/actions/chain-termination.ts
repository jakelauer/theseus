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
		["result", false],
		["resultAsync", false],
		["lastly", true],
	]);

	public override runTest({ prop }: ProxyActionMapParameters): boolean 
	{
		const propMatches = this.matchAgainstProps.has(prop);

		log.trace(`Chain termination action test result for property "${prop}":`);

		return propMatches;
	}
	
	public override process({ prop, proxyManager, proxy }: ProxyActionMapParameters) 
	{
		const processReturnsProxy = this.matchAgainstProps.get(prop) ?? false;

		proxyManager.onChainEnd(prop);

		if (processReturnsProxy)
		{
			return proxy;
		}

		const toReturn = proxyManager.queue.asyncEncountered 
			? proxyManager.queue.queue 
			: proxyManager.params.target
				.result;

		log.verbose(`Returning result for property "${prop}". Async: ${proxyManager.queue.asyncEncountered}`, {
			toReturn,
		});

		return toReturn;
	}
}
