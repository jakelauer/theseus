import type { ProxyActionMapParameters } from "../proxy-action-map.js";
import { ProxyActions, ProxyActionType } from "../proxy-actions.js";

export class ChainHelperAction extends ProxyActions 
{
	public override type: ProxyActionType = ProxyActionType.chainHelper;

	public override runTest({ prop }: ProxyActionMapParameters): boolean 
	{
		const matchedProps = new Set(["and", "lastly", "andAsync", "lastlyAsync"]);

		return matchedProps.has(prop);
	}

	public override process({ proxy }: ProxyActionMapParameters) 
	{
		return proxy;
	}
}
