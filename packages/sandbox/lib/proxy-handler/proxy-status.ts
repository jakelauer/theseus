import { getTheseusLogger } from "theseus-logger";
import isElligibleForProxy from "./validity/is-elligible-for-proxy";

interface ProxyStatusAll {
    root: boolean;
    properties: {
        every: boolean;
        some: boolean;
    };
}

type ProxyStatus<TRecursive> =
    TRecursive extends true 
		? ProxyStatusAll 
		: Omit<ProxyStatusAll, "properties">;


interface Params {
	objectChecker: (obj: any) => boolean;
}

const log = getTheseusLogger("proxy-status");

function objectPropertiesAreProxy(obj: any, params: Params): ProxyStatus<true>["properties"] 
{
	let some = false;
	let every = true;

	function recursiveCheck(o: any) 
	{
		if (isElligibleForProxy(o)) 
		{
			if (params.objectChecker(o)) 
			{
				some = true;
			}
			else 
			{
				every = false;
			}
			
			for (const key in o) 
			{
				if (Object.prototype.hasOwnProperty.call(o, key)) 
				{
					recursiveCheck(o[key]);
				}
			}
		}
		else if (Array.isArray(o)) 
		{
			for (let i = 0; i < o.length; i++) 
			{
				recursiveCheck(o[i]);
			}
		}
	}

	recursiveCheck(obj);

	return {
		every: every,
		some: some,
	};
}

export const proxyStatus = <T extends object, TRecursive extends boolean>(
	obj: T,
	params: Params,
	recursive: TRecursive = true as TRecursive,
): ProxyStatus<TRecursive> => 
{
	const rootIsProxy = params.objectChecker(obj);

	if (!recursive) 
	{
		return {
			root: rootIsProxy,
		} as ProxyStatus<TRecursive>;
	}

	let propertiesAreProxy: ProxyStatus<true>["properties"] | undefined;

	if (recursive) 
	{
		propertiesAreProxy = objectPropertiesAreProxy(obj, params);
		if (rootIsProxy && !propertiesAreProxy.every) 
		{
			warnIfPartialSandbox();
		}
	}

	return {
		root: rootIsProxy,
		properties: propertiesAreProxy,
	} as ProxyStatus<TRecursive>;
};

const warnIfPartialSandbox = () => 
{
	log.warn(
		"Root object is a sandbox proxy, but it contains non-sandboxed objects as properties. This may cause unexpected behavior.",
	);
};
	
