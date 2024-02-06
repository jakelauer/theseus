export type Func<TParams = any, TOutput = any> = (...args: TParams[]) => TOutput;

export type ParametersMinusFirst<T extends (...args: any) => any> = DropFirst<Parameters<T>>;

export type FuncMinusFirstArg<TFunc extends Func, TOutput = ReturnType<TFunc>> = (
    ...args: ParametersMinusFirst<TFunc>
) => TOutput;

/**
 * Removes the first parameter from a set
 */
export type DropFirst<T extends unknown[]> = T extends [any, ...infer U] ? U : never;

/**
 * Represents a type that checks if a specified type (`TCheckIfDisallowed`) is assignable to another type (`DisallowedType`).
 * If assignable, it further checks for an exact match using `DisallowExactMatch`.
 * @template TCheckIfDisallowed - The type to check.
 * @template DisallowedType - The type that is disallowed.
 * @template TOtherwise - The fallback type if the check fails.
 */
type DisallowMatch<TCheckIfDisallowed, DisallowedType, TOtherwise> = [DisallowedType] extends [TCheckIfDisallowed] // Checks if R is assignable to DisallowedType
    ? DisallowExactMatch<TCheckIfDisallowed, DisallowedType, TOtherwise>
    : TOtherwise; // Allow if R is not assignable to DisallowedType

/**
 * Checks if a specified type (`TCheckIfDisallowed`) is exactly the same as another type (`DisallowedType`).
 * If it is, the type resolves to `never`, otherwise, it falls back to `TOtherwise`.
 * @template TCheckIfDisallowed - The type to check for an exact match.
 * @template DisallowedType - The type to compare against.
 * @template TOtherwise - The fallback type if the check fails.
 */
type DisallowExactMatch<TCheckIfDisallowed, DisallowedType, TOtherwise> = Exclude<
    TCheckIfDisallowed,
    DisallowedType
> extends never // Exclude R from DisallowedType, if nothing remains, it means R is exactly DisallowedType
    ? never // Disallow if R is exactly DisallowedType
    : TOtherwise; // Allow if R is not exactly DisallowedType, but is assignable to it (like boolean when DisallowedType is true | false)

/**
 * Determines whether a potential function type (`TPotentialFunction`) returns a disallowed type (`DisallowedType`).
 * Utilizes `DisallowMatch` to perform the check.
 * @template TPotentialFunction - The function type to check.
 * @template DisallowedType - The return type that is disallowed.
 */
type FunctionReturnsDisallowedType<TPotentialFunction, DisallowedType> = TPotentialFunction extends (
    ...args: any[]
) => infer R
    ? DisallowMatch<R, DisallowedType, TPotentialFunction>
    : TPotentialFunction;

/**
 * Blocks a type (`T`) if its return type matches the disallowed type (`DisallowedType`).
 * Uses `FunctionReturnsDisallowedType` for the check and resolves to `never` if the check is true.
 * @template T - The type to check and possibly block.
 * @template DisallowedType - The return type that is disallowed.
 */
export type BlockFunctionsWithDisallowedType<TPotentialFunction, DisallowedType> = FunctionReturnsDisallowedType<
    TPotentialFunction,
    DisallowedType
> extends true // true, in this case, means "not never"
    ? never
    : TPotentialFunction;

/**
 * Constructs an object type where each property is a function, and none of the functions are allowed to return a specified disallowed type.
 * @template T - The object type with function properties.
 * @template DisallowedType - The return type that is disallowed for the functions.
 */
export type FuncDict_DisallowReturnType<T extends Record<string, (...args: any[]) => any>, DisallowedType> = {
    [K in keyof T]: BlockFunctionsWithDisallowedType<T[K], DisallowedType>;
};

/**
 * @template TOutput - Function type to be modified.
 * @description Intermediate type that applies the Readonly wrapper to the return type of a function, if the return type is an object.
 */
export type ReadonlyReturnType<TOutput extends (...args: any[]) => any> = ReturnType<TOutput> extends object
    ? (...args: Parameters<TOutput>) => Readonly<ReturnType<TOutput>>
    : TOutput;

/**
 * @template TOutput - Function type to be processed.
 * @description Forces the return type of a function to be Readonly if the return type is an object.
 * Utilizes ReadonlyReturnType to apply the Readonly wrapper conditionally.
 */
export type ForceReadonlyReturnType<TOutput> = TOutput extends (...args: any[]) => any
    ? ReadonlyReturnType<TOutput>
    : never;
