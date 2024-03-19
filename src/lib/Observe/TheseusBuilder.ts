import type { BroadcasterObserver } from '@Broadcast/BroadcasterObserver';
import { EvolverComplex } from '@Evolvers/EvolverComplex';
import { Theseus } from '@Observe/Theseus';
import { RefineryComplex } from '@Refineries/RefineryComplex';

import type { RefineryComplexInstance } from "@Refineries/RefineryComplex";
import type { TheseusParams } from "@Observe/Theseus";
import type { EvolverComplexInstance } from "@Evolvers/EvolverComplex";
import type { EvolverInstance } from "@Evolvers/Types/EvolverTypes";
import type { MutatorDefs } from "@Evolvers/Types/MutatorTypes";
import type { RefineryInitializer } from "@Refineries/Refinery";
import type { ForgeDefs } from "@Refineries/Types";
import type { Immutable } from "@Shared/String/makeImmutable";
import type { Mutable } from "@Shared/String/makeMutable";

/** Create a new Theseus instance */
export const builder2 = <
    TData extends object,
    TParamName extends string,
    TMutators extends MutatorDefs<TData, Mutable<TParamName>>,
    TEvolverNames extends string,
    TEvolvers extends { [K in TEvolverNames]: EvolverInstance<TData, K, Mutable<TParamName>, TMutators> },
    TForges extends ForgeDefs<TData, Immutable<TParamName>>,
    TRefineries extends Record<string, RefineryInitializer<TData, TParamName, TForges>>,
    TObserverType extends BroadcasterObserver<TData> = BroadcasterObserver<TData>,
>(
    params: TheseusParams<TData, TObserverType>,
    evolvers: TEvolvers,
    refineries?: TRefineries | RefineryComplexInstance<TData, TParamName, TForges, TRefineries>,
) => {
    const theseusInstance = new Theseus<TData, TObserverType>(params);

    type RefineryComplex = RefineryComplexInstance<TData, TParamName, TForges, TRefineries>;
    type Extension = {
        evolve: EvolverComplexInstance<TData, TParamName, TMutators, TEvolvers>["__types__"]["evolveReturn"];
        mutate: EvolverComplexInstance<TData, TParamName, TMutators, TEvolvers>["__types__"]["mutateReturn"];
        refine?: ReturnType<RefineryComplex["refine"]>;
    };

    console.log(evolvers);
    console.log(refineries);

    return theseusInstance as Theseus<TData, TObserverType> & Extension;
};

/** Create a new Theseus instance */
const builder = <
    TData extends object,
    TObserverType extends BroadcasterObserver<TData> = BroadcasterObserver<TData>,
>(
    params: TheseusParams<TData, TObserverType>,
) => {
    const theseusInstance = new Theseus<TData, TObserverType>(params);

    const addEvolversAndRefineries = <
        TEvolverName extends string,
        TParamName extends string,
        TMutators extends MutatorDefs<TData, Mutable<TParamName>>,
        TEvolvers extends Record<
            string,
            EvolverInstance<TData, TEvolverName, Mutable<TParamName>, TMutators>
        >,
        TForges extends ForgeDefs<TData, Immutable<TParamName>>,
        TRefineries extends Record<string, RefineryInitializer<TData, TParamName, TForges>>,
    >(
        evolvers: TEvolvers,
        refineries?: TRefineries | RefineryComplexInstance<TData, TParamName, TForges, TRefineries>,
    ) => {
        const evolverComplex = EvolverComplex.create<TData>().withEvolvers(evolvers);

        // set theseus id for each evolver, so that we can track which theseus is being used
        Object.values(evolverComplex.__evolvers__).forEach((evolver) =>
            evolver.__setTheseusId(theseusInstance.__uuid),
        );

        type RefineryComplex = RefineryComplexInstance<TData, TParamName, TForges, TRefineries>;
        type Extension = {
            evolve: ReturnType<EvolverComplexInstance<TData, TParamName, TMutators, TEvolvers>["evolve"]>;
            mutate: ReturnType<typeof evolverComplex.mutate>;
            refine?: ReturnType<RefineryComplex["refine"]>;
        };

        const extension: Extension = {
            evolve: evolverComplex.evolve(theseusInstance.state),
            mutate: evolverComplex.mutate(theseusInstance.state),
        };

        if (refineries) {
            const complex: RefineryComplex =
                "refine" in refineries ?
                    (refineries as RefineryComplex)
                :   RefineryComplex.create<TData>().withRefineries(refineries);

            Object.defineProperties<Extension>(extension, {
                refine: {
                    get: () => {
                        const instanceState = Theseus.getInstance(theseusInstance.__uuid).state;
                        return complex.refine(instanceState);
                    },
                },
            });
        }

        return extension;
    };

    /** Extend Theseus with additional methods */
    const extendTheseusWith = <TTheseus extends Theseus<TData>, TExtension extends object>(
        instance: TTheseus,
        extension: TExtension,
    ) => {
        const propertyMapFromExtension = Object.keys(extension).reduce((acc, key) => {
            const propertyDescriptor: any = Object.getOwnPropertyDescriptor(extension, key);
            if (propertyDescriptor.get || propertyDescriptor.set) {
                acc[key] = {};
                if (propertyDescriptor.get) {
                    acc[key].get = propertyDescriptor.get; // Assign the getter function
                }
                if (propertyDescriptor.set) {
                    acc[key].set = propertyDescriptor.set; // Assign the setter function
                }
            } else {
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

    const extendable = extendTheseusWith(theseusInstance, {
        with: <
            TEvolverName extends string,
            TParamName extends string,
            TMutators extends MutatorDefs<TData, Mutable<TParamName>>,
            TEvolvers extends Record<
                string,
                EvolverInstance<TData, TEvolverName, Mutable<TParamName>, TMutators>
            >,
            TForges extends ForgeDefs<TData, Immutable<TParamName>>,
            TRefineries extends Record<string, RefineryInitializer<TData, TParamName, TForges>>,
        >({
            evolvers,
            refineries,
        }: {
            evolvers: TEvolvers;
            refineries?: TRefineries | RefineryComplexInstance<TData, TParamName, TForges, TRefineries>;
        }) => {
            return extendTheseusWith(theseusInstance, addEvolversAndRefineries(evolvers, refineries));
        },
    });

    return extendable;
};

export default builder;
