type RemoveEvolverStartNoCaps<T extends string> = T extends `Evolver${infer Rest}` ? Rest : T;
type RemoveEvolverEndNoCaps<T extends string> = T extends `${infer Rest}Evolver` ? Rest : T;
type RemoveEvolverNoCaps<T extends string> = RemoveEvolverStartNoCaps<RemoveEvolverEndNoCaps<T>>;
type RemoveEvolverStartCaps<T extends string> = T extends `Evolver${infer Rest}` ? Rest : T;
type RemoveEvolverEndCaps<T extends string> = T extends `${infer Rest}Evolver` ? Rest : T;
type RemoveEvolverCaps<T extends string> = RemoveEvolverStartCaps<RemoveEvolverEndCaps<T>>;
export type RemoveEvolverFromName<T extends string> = RemoveEvolverNoCaps<RemoveEvolverCaps<T>>;
export type EvolverRenamedForComplex<T extends string> = RemoveEvolverFromName<T>;

export const renameEvolverForComplex = <T extends string>(name: T): EvolverRenamedForComplex<T> => {
    // Regular expression to match 'Evolver' or 'Evolver' at the start and/or end of the string
    const regex = /^(Evolver|Evolver)?(.*?)(Evolver|Evolver)?$/;
    return name.replace(regex, "$2") as EvolverRenamedForComplex<T>;
};
