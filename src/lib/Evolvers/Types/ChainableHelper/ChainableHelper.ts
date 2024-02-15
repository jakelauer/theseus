// export type ChainableMutators<
//     TData,
//     TParamName extends Mutable<string>,
//     TMutators extends MutatorDefChild<TData, TParamName>,
//     IsFinal extends FinalTracker = "notFinal",
//     IsAsync extends AsyncTracker = IsChainAsync<TMutators, "sync">,
// > = {
//     [K in keyof TMutators]: TMutators[K] extends (...args: any[]) => Promise<any> ?
//         IsFinal extends "final" ?
//             FuncMinusFirstArg<(...args: Parameters<TMutators[K]>) => Promise<TData>>
//         :   // For async mutators, return a function type that expects the mutator's parameters (minus the first one)
//             // and returns a Promise of the mutated data type.
//             AsyncChainable<TData, TParamName, TMutators, TMutators[K], "async", "notFinal">
//     : TMutators[K] extends (...args: any[]) => any ?
//         // For sync mutators, if it's the final operation, determine if the entire chain is async and adjust the return type accordingly.
//         // Otherwise, return a SyncChainable type allowing further chaining or finalization.
//         IsFinal extends "final" ?
//             IsChainAsync<TMutators, IsAsync> extends "async" ?
//                 FuncMinusFirstArg<(...args: Parameters<TMutators[K]>) => Promise<TData>>
//             :   FuncMinusFirstArg<(...args: Parameters<TMutators[K]>) => TData>
//         : IsChainAsync<TMutators, IsAsync> extends "async" ?
//             AsyncChainable<TData, TParamName, TMutators, TMutators[K], "async", "notFinal">
//         :   SyncChainable<TData, TParamName, TMutators, TMutators[K], IsAsync, "notFinal">
//     : TMutators[K] extends { [key: string]: any } ?
//         // For nested mutator objects, recursively apply ChainableMutators to enable deep chaining.
//         ChainableMutators<TData, TParamName, TMutators[K], IsFinal, IsAsync>
//     :   never;
// };
