import type { BroadcasterObserver } from "@Broadcast/BroadcasterObserver";
import type { EvolverComplexInstance } from "@Evolvers/EvolverComplex";
import { EvolverComplex, EvolversSymbol } from "@Evolvers/EvolverComplex";
import { RefineryComplex } from "@Refineries/RefineryComplex";
import { getTheseusLogger } from "theseus-logger";

import { Theseus } from "./Theseus.js";

import type { MacroMutatorsFormatted, MutatorsFormatted } from "@Evolvers/Types/EvolverComplexTypes";
import type { EvolverInstance } from "@Evolvers/Types/EvolverTypes";
import type { MutatorDefs } from "@Evolvers/Types/MutatorTypes";
import type { Refinery } from "@Refineries/Refinery";
import type { RefineryComplexInstance } from "@Refineries/RefineryComplex";
import type { ForgeDefs } from "@Refineries/Types";
import type { RefineriesRemapped } from "@Refineries/Types/RefineryComplexTypes";
import type { ITheseus, TheseusParams } from "@Types/Theseus";
const log = getTheseusLogger("TheseusBuilder");

/** Extend Theseus with additional methods */
const extendTheseusWith = <TTheseus extends ITheseus<any>, TExtension extends object>(
	instance: TTheseus,
	extension: TExtension,
) => 
{
	const propertyMapFromExtension = Object.keys(extension).reduce((acc, key) => 
	{
		const propertyDescriptor: any = Object.getOwnPropertyDescriptor(extension, key);
		if (propertyDescriptor.get || propertyDescriptor.set) 
		{
			acc[key] = {};
			if (propertyDescriptor.get) 
			{
				acc[key].get = propertyDescriptor.get; // Assign the getter function
			}
			if (propertyDescriptor.set) 
			{
				acc[key].set = propertyDescriptor.set; // Assign the setter function
			}
		}
		else 
		{
			acc[key] = {
				value: propertyDescriptor.value,
				writable: true,
			};
		}

		return acc;
	}, {} as PropertyDescriptorMap);

	Object.defineProperties(instance, propertyMapFromExtension);

	return instance as TTheseus & TExtension;
};

/** Create a new Theseus instance */
export default <TData extends object>(data: TData) => ({
	maintainWith: <
        TParamNoun extends string,
        TMutators extends MutatorDefs<TData, TParamNoun>,
        TEvolvers extends EvolverInstance<TData, string, TParamNoun, TMutators>[],
        TForges extends ForgeDefs<TData, TParamNoun>,
        TRefineries extends Refinery<TData, string, TParamNoun, TForges>[],
        TObserverType extends BroadcasterObserver<TData> = BroadcasterObserver<TData>,
    >(
		params: TheseusParams<TData, TParamNoun, TMutators, TEvolvers, TForges, TRefineries, TObserverType>,
	) => 
	{
		const {
			evolvers, refineries, ...rest 
		} = params;
		const theseusInstance = Theseus.__private_create<TData, TObserverType>(data, rest);

        type ParamsAbbrev = TheseusParams<TData, TParamNoun, TMutators, TEvolvers, TForges, TRefineries, TObserverType>;

        type RefineExtension = {
            refine?: RefineriesRemapped<TData, TParamNoun, TForges, TRefineries>;
        };

        type BaseExtension = {
            evolve: MacroMutatorsFormatted<TData, TParamNoun, TEvolvers>;
            mutate: MutatorsFormatted<TData, TParamNoun, TEvolvers>;
        };
        type Extension = BaseExtension &
            (ParamsAbbrev["refineries"] extends undefined ? RefineExtension : Required<RefineExtension>);

        const addEvolversAndRefineries = (
        	innerInstance: ITheseus<TData>,
        	evolvers: TEvolvers | EvolverComplexInstance<TData, TParamNoun, TMutators, TEvolvers>,
        	refineries?: TRefineries | RefineryComplexInstance<TData, TParamNoun, TForges, TRefineries>,
        ) => 
        {
        	const evolverComplex: EvolverComplexInstance<TData, TParamNoun, TMutators, TEvolvers> =
                "evolve" in evolvers ?
                	(evolvers as EvolverComplexInstance<TData, TParamNoun, TMutators, TEvolvers>)
                	:   EvolverComplex.create<TData>().withEvolvers(...evolvers);

        	// set theseus id for each evolver, so that we can track which theseus is being used
        	Object.values(evolverComplex[EvolversSymbol]).forEach(
        		(evolver: EvolverInstance<TData, string, TParamNoun, TMutators>) =>
        			evolver.__setTheseusId(innerInstance.__uuid),
        	);

        	evolverComplex.addTheseusId(innerInstance.__uuid);

        	let extension: BaseExtension = {
        		evolve: evolverComplex.evolve(innerInstance.state),
        		mutate: evolverComplex.mutate(innerInstance.state),
        	};

        	log.verbose(
        		`Added evolvers and mutators to extension for Theseus instance ${innerInstance.__uuid}`,
        		extension,
        	);

        	if (refineries) 
        	{
        		log.verbose(`Refineries found, adding to extension for Theseus instance ${innerInstance.__uuid}`);
        		const complex: RefineryComplexInstance<TData, TParamNoun, TForges, TRefineries> =
                    "refine" in refineries ?
                    	(refineries as RefineryComplexInstance<TData, TParamNoun, TForges, TRefineries>)
                    	:   RefineryComplex.create<TData>().withRefineries(...refineries);

        		extension = Object.defineProperties<BaseExtension>(
                    {
                    	...extension,
                    	refine: undefined,
                    } as any,
                    {
                    	refine: {
                    		get: () => 
                    		{
                    			const instanceState = Theseus.getInstance(innerInstance.__uuid).state;
                    			return complex.refine(instanceState);
                    		},
                    	},
                    },
        		) as Extension;

        		log.verbose(`Added refineries to extension for Theseus instance ${innerInstance.__uuid}`, extension);
        	}

        	return extension as Extension;
        };

        log.verbose(
        	`Extending Theseus instance ${theseusInstance.__uuid} with evolvers and refineries`,
        	theseusInstance,
        );

        const extension = addEvolversAndRefineries(theseusInstance, evolvers, refineries);

        log.verbose(`Built extension for Theseus instance ${theseusInstance.__uuid}`);

        const theseusExtended = extendTheseusWith<ITheseus<TData>, Extension>(theseusInstance, extension);

        log.verbose(`Theseus instance ${theseusInstance.__uuid} is ready`);

        return theseusExtended;
	},
});
