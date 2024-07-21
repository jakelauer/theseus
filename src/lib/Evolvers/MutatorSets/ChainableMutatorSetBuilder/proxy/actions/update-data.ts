import type { ProxyActionMapParameters } from "../proxy-action-map.js";
import { ProxyActions, ProxyActionType } from "../proxy-actions.js";

export class UpdateDataAction extends ProxyActions 
{
	public override type: ProxyActionType = ProxyActionType.updateData;

	public override runTest({ prop }: ProxyActionMapParameters): boolean 
	{
		return prop === "setData";
	}

	public override process({ target }: ProxyActionMapParameters) 
	{
		return target.replaceData;
	}
}
