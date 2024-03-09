import { EvolverComplex, EvolverComplexInstance } from "@Evolvers/EvolverComplex";
import { EvolverInstance, MutatorDefs } from "@Evolvers/Types";
import { IObservation, Observation, ObservationExtendable } from "@Observe/Observation";
import { RefineryInitializer } from "@Refineries/Refinery";
import { RefineryComplex, RefineryComplexInstance } from "@Refineries/RefineryComplex";
import { ForgeDefs } from "@Refineries/Types";
import { Immutable } from "@Shared/String/makeImmutable";
import { Mutable } from "@Shared/String/makeMutable";

/**
 * Extends an Observation instance with additional methods for refining and evolving data. This lets the user
 * define and apply refineries and evolvers to the data, keeping them separate from the Observation instance
 * itself.
 */
const extendObservation = <TObservationInstance extends IObservation<TData>, TData extends object>(
    instance: TObservationInstance,
) => {
    return extendTheseusWith(instance, {
        evolveWith: evolveExtender(instance),
    });
};

/** Add evolvers to the Theseus instance */
const evolveExtender =
    <TData extends object, TInstance extends IObservation<TData>, TParamName extends string>(
        instance: TInstance,
    ) =>
    <
        TMutators extends MutatorDefs<TData, Mutable<TParamName>>,
        TEvolvers extends Record<string, EvolverInstance<TData, string, Mutable<TParamName>, TMutators>>,
    >(
        evolvers: TEvolvers | EvolverComplexInstance<TData, TParamName, TMutators, TEvolvers>,
    ) => {
        const evolverComplex =
            "mutate" in evolvers && "evolve" in evolvers ?
                (evolvers as EvolverComplexInstance<TData, TParamName, TMutators, TEvolvers>)
            :   EvolverComplex.create<TData>().withEvolvers(evolvers);

        // set observation id for each evolver, so that we can track which observation is being used
        Object.values(evolverComplex.__evolvers__).forEach((evolver) =>
            evolver.__setObservationId(instance.__uuid),
        );

        const theseusWithEvolve = extendTheseusWith(instance, {
            evolve: evolverComplex.evolve(instance.state),
            mutate: evolverComplex.mutate(instance.state),
        });

        return extendTheseusWith(theseusWithEvolve, { refineWith: refineExtender(theseusWithEvolve) });
    };

/** Add refineries to the Theseus instance */
const refineExtender =
    <TData extends object, TInstance extends IObservation<TData>, TParamName extends string>(
        instance: TInstance,
    ) =>
    <
        TForges extends ForgeDefs<TData, Immutable<TParamName>>,
        TRefineries extends Record<string, RefineryInitializer<TData, TParamName, TForges>>,
    >(
        refineries: TRefineries | RefineryComplexInstance<TData, TParamName, TForges, TRefineries>,
    ) => {
        type Complex = RefineryComplexInstance<TData, TParamName, TForges, TRefineries>;

        const complex: Complex =
            "refine" in refineries ?
                (refineries as Complex)
            :   RefineryComplex.create<TData>().withRefineries(refineries);

        const refineGetter = Object.defineProperties<{ refine: ReturnType<Complex["refine"]> }>(
            {
                refine: {},
            } as any,
            {
                refine: {
                    get: () => {
                        const instanceState = Observation.getInstance(instance.__uuid).state;
                        return complex.refine(instanceState);
                    },
                },
            },
        );
        const theseusWithRefine = extendTheseusWith<TData, TInstance, ReturnType<Complex["refine"]>>(
            instance,
            refineGetter as any,
        );

        return theseusWithRefine;
    };

/** Extend Theseus with additional methods */
const extendTheseusWith = <
    TData extends object,
    TObservation extends IObservation<TData>,
    TExtension extends object,
>(
    instance: TObservation,
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

    return instance as ObservationExtendable<TData, TObservation, TExtension>;
};

export default extendObservation;
