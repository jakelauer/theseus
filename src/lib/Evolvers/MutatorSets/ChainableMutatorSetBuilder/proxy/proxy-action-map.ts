import { getTheseusLogger } from "theseus-logger";
import type { ChainableMutatorQueue } from "../ChainableMutatorQueue.js";
import { ChainHelperAction } from "./actions/chain-helper.js";
import { ChainTerminationAction } from "./actions/chain-termination.js";
import { FunctionAction } from "./actions/function.js";
import { MutatorAction } from "./actions/mutator.js";
import { PropertyAction } from "./actions/property.js";
import { ToJsonAction } from "./actions/to-json.js";
import { UpdateDataAction } from "./actions/update-data.js";
import type { ChainingProxyManager } from "./chaining-proxy-manager.js";
import { ProxyActions } from "./proxy-actions.js";
import { ProxyActionType } from "./proxy-actions.js";

const log = getTheseusLogger("proxy-action-map");

export interface ProxyActionMapParameters {
    target: any;
    prop: string;
    proxyManager: ChainingProxyManager<any>;
    proxy: ChainingProxyManager<any>;
    queue: ChainableMutatorQueue<any, any>;
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

		log.verbose(`Action determined for property "${params.prop}": ${ProxyActions.flagNames(requestType)}`);

		return requestType;
	}

	public static process(params: ProxyActionMapParameters, requestType: ProxyActionType) 
	{
		const { prop } = params;
		let toReturn: any = undefined; // Initial value is undefined to indicate "not set"

		this.actions.forEach((action) => 
		{
			if (action.type & requestType) 
			{
				const forType = action.type & requestType;

				const actionResult = action.process(params, forType);

				log.verbose(`[${prop}] processed as "${ProxyActionType[forType]}"`);

				if (typeof actionResult !== "undefined") 
				{
					toReturn = toReturn ?? actionResult;
				}
			}
		});

		// If after checking all bits toReturn is still undefined, it means no valid action was matched.
		if (typeof toReturn === "undefined") 
		{
			log.trace(`Property or action "${prop}" not found in target or not supported`);
			throw new Error(`Property or action "${prop}" not found in target or not supported`);
		}

		return toReturn;
	}
}
