import { DestroyCallback } from "../Observable/Broadcaster";

export type TheseusActionReturn<TDataType> = Partial<TDataType> | Promise<Partial<TDataType>>;

export type TheseusActions<TDataType> = Record<
    any,
    (state: TDataType, ...args: any[]) => TheseusActionReturn<TDataType>
>;

// Ditch the first parameter argument of a function
export type OmitFirstArg<F extends (state: any, ...args: any[]) => any> =
    F extends (state: any, ...args: infer P) => ReturnType<F> ? (...args: P) => ReturnType<F> : F;

export type AsyncReturn = { async: Promise<boolean> };

export type AsyncTheseusActions<TDataType, TActions extends TheseusActions<TDataType>> = {
    [K in keyof TActions]: OmitFirstArg<(...args: Parameters<TActions[K]>) => AsyncReturn>;
};

export interface ITheseus<TDataType, TObserverProps, T extends TheseusActions<TDataType>> {
    state: TDataType;

    actions: AsyncTheseusActions<TDataType, T>;

    observe(
        callback: (newData: TDataType) => void,
        props?: TObserverProps,
        updateImmediately?: boolean,
    ): DestroyCallback;
}
