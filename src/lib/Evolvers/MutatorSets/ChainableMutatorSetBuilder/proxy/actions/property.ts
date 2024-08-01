import type { ProxyActionMapParameters } from "../proxy-action-map.js";
import { ProxyActions, ProxyActionType } from "../proxy-actions.js";

export class PropertyAction extends ProxyActions 
{
	public override type: ProxyActionType = ProxyActionType.property;

	public static propInTarget({ prop, target }: ProxyActionMapParameters)
	{
		return prop in target;
	}

	public override runTest(
		params: ProxyActionMapParameters,
		matchingRequestTypes: ProxyActionType,
	): boolean 
	{
		return matchingRequestTypes === ProxyActionType.none
			&& PropertyAction.propInTarget(params);
	}

	public override process({ target, prop }: ProxyActionMapParameters) 
	{
		return target[prop];
	}
}
