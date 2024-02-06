type WithoutRefineryStartNoCaps<T extends string> = T extends `refinery${infer Rest}` ? Rest : T;
type WithoutRefineryEndNoCaps<T extends string> = T extends `${infer Rest}refinery` ? Rest : T;
type WithoutRefineryNoCaps<T extends string> = WithoutRefineryStartNoCaps<WithoutRefineryEndNoCaps<T>>;
type WithoutRefineryStartCaps<T extends string> = T extends `Refinery${infer Rest}` ? Rest : T;
type WithoutRefineryEndCaps<T extends string> = T extends `${infer Rest}Refinery` ? Rest : T;
type WithoutRefineryCaps<T extends string> = WithoutRefineryStartCaps<WithoutRefineryEndCaps<T>>;
export type RemoveRefineryFromName<T extends string> = WithoutRefineryNoCaps<WithoutRefineryCaps<T>>;
export type RefineryRenamedForComplex<T extends string> = RemoveRefineryFromName<T>;

export const renameRefineryForComplex = <T extends string>(name: T): RefineryRenamedForComplex<T> => {
    // Regular expression to match 'refinery' or 'Refinery' at the start and/or end of the string
    const regex = /^(refinery|Refinery)?(.*?)(refinery|Refinery)?$/;
    return name.replace(regex, "$2") as RefineryRenamedForComplex<T>;
};
