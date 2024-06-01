import type { ProxyActionMapParameters } from "../proxy-action-map";
import { ProxyActions, ProxyActionType } from "../proxy-actions";

export class PropertyAction extends ProxyActions
{
	public override type: ProxyActionType = ProxyActionType.property;

	public override runTest({ target, prop }: ProxyActionMapParameters, matchingRequestTypes: ProxyActionType): boolean 
	{
		return matchingRequestTypes === ProxyActionType.none && prop in target;
	}
	
	public override process({ target, prop }: ProxyActionMapParameters) 
	{
		return target[prop];;
	}
}
