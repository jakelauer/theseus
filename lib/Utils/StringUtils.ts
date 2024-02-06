import { Mutable } from "../Evolvers/Types/MutatorTypes";
import { Immutable } from "../Refineries";

export function capitalizeFirstLetter<T extends string>(str: T): Capitalize<T> {
    return (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<T>;
}

export function makeMutable<T extends string>(str: T): Mutable<T> {
    const capitalized = (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<T>;

    return `mutable${capitalized}`;
}

export function makeImmutable<T extends string>(str: T): Immutable<T> {
    const capitalized = (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<T>;

    return `immutable${capitalized}`;
}
