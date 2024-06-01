import { getTheseusLogger } from "../../../../Shared";
import { ChainHelperAction } from "./actions/chain-helper";
import { ChainTerminationAction } from "./actions/chain-termination";
import { FunctionAction } from "./actions/function";
import { MutatorAction } from "./actions/mutator";
import { PropertyAction } from "./actions/property";
import { ToJsonAction } from "./actions/to-json";
import { UpdateDataAction } from "./actions/update-data";
import type { ChainingProxyManager } from "./chaining-proxy-manager";
import { ProxyActions } from "./proxy-actions";
import { ProxyActionType } from "./proxy-actions";

const log = getTheseusLogger("proxy-action-map");

export interface ProxyActionMapParameters
{
	target: any, 
	prop: string, 
	proxyManager: ChainingProxyManager<any>,
	proxy: ChainingProxyManager<any>
}

export class ProxyActionMap
{
	private static actions: ProxyActions[] = [
		new ChainHelperAction(),
		new FunctionAction(),
		new MutatorAction(),
		new ToJsonAction(),
		new UpdateDataAction(),
		new ChainTerminationAction(),
		new PropertyAction(),
	];

	public static determineAction(params: ProxyActionMapParameters): ProxyActionType
	{
		const requestType = this.actions.reduce((acc, action) => 
		{
			acc |= action.test(params, acc) ? action.type : ProxyActionType.none;

			return acc;
		}, ProxyActionType.none);

		log.debug(`Action determined for property "${params.prop}": ${ProxyActions.flagNames(requestType)}`);

		return requestType;
	}

	public static process(params: ProxyActionMapParameters, requestType: ProxyActionType)
	{
		const { prop, proxy } = params;
		let toReturn: any = undefined; // Initial value is undefined to indicate "not set"

		this.actions.forEach((action) => 
		{
			if (action.type & requestType) 
			{
				const forType = action.type & requestType;

				log.verbose(`Processing action "${ProxyActionType[forType]}" processed for property "${prop}"`);

				const actionResult = action.process(params, forType);

				log.verbose(`Action "${ProxyActionType[forType]}" processed for property "${prop}"`);

				if (typeof actionResult !== "undefined") 
				{
					toReturn = toReturn ?? actionResult;
				}
			}
		});


		// If after checking all bits toReturn is still undefined, it means no valid action was matched.
		if (typeof toReturn === "undefined") 
		{
			log.trace(`Property or action "${prop}" not found in target or not supported`, { prop, proxy });
			throw new Error(`Property or action "${prop}" not found in target or not supported`);
		}

		return toReturn;
	}
}
