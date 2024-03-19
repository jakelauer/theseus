import type { SortaPromise } from "@Evolvers/Types/EvolverTypes";
import type { MutableData, Mutator } from "@Evolvers/Types/MutatorTypes";
import getTheseusLogger from '@Shared/Log/get-theseus-logger';

import type { Mutable } from "@Shared/String/makeMutable";

const log = getTheseusLogger("Queue");

interface Params<TData extends object, TParamName extends Mutable<string>> {
    argName: TParamName;
    setMutableData: (data: MutableData<TData, TParamName>) => void;
    getMutableData: () => MutableData<TData, TParamName>;
}

export const buildChainableMutatorQueue = <TData extends object, TParamName extends Mutable>({
    argName,
    getMutableData,
    setMutableData,
}: Params<TData, TParamName>) => {
    let isAsyncEncountered = false;
    let queue: Promise<any> = Promise.resolve();

    const buildQueueOperation = (
        selfPath: string,
        mutator: Mutator<TData, TParamName, SortaPromise<TData>>,
        args: any[],
    ) => {
        return () => {
            const mutableData = getMutableData();
            const mutatorResult = mutator(mutableData, ...args);

            if (mutatorResult === undefined || mutatorResult === null) {
                throw new Error(
                    `Mutator ${selfPath} returned ${mutatorResult}. Mutators must return a value compatible with the mutable data type.`,
                );
            }

            if (mutatorResult instanceof Promise) {
                // Async operation encountered, switch to queuing mode
                isAsyncEncountered = true;
                return mutatorResult.then((result) => {
                    if (typeof result !== "object") {
                        throw new Error(
                            `Expected mutator ${selfPath} to return an object, but got type "${typeof result}" from value ${JSON.stringify(
                                result,
                            )}.`,
                        );
                    }
                    log.verbose(`{ASYNC} ${selfPath} = `, result);
                    setMutableData(inputToObject(result)); // Assuming funcResult updates mutableData
                    return result;
                });
            } else {
                if (typeof mutatorResult !== "object") {
                    throw new Error(
                        `Expected mutator ${selfPath} to return an object, but got type "${typeof mutatorResult}" from value ${JSON.stringify(
                            mutatorResult,
                        )}.`,
                    );
                }
                log.verbose(`{SYNC} ${selfPath} = `, mutatorResult);
                setMutableData(inputToObject(mutatorResult)); // Assuming funcResult updates mutableData
                return mutatorResult;
            }
        };
    };

    const inputToObject = (input: TData): { [key in TParamName]: TData } => {
        return { [argName]: input } as {
            [key in TParamName]: TData;
        };
    };

    function queueMutation<TFuncReturn extends Promise<TData>>(
        mutatorPath: string,
        func: Mutator<TData, TParamName, TFuncReturn>,
        args: any[],
    ): Promise<TData>;
    function queueMutation<TFuncReturn extends TData>(
        mutatorPath: string,
        func: Mutator<TData, TParamName, TFuncReturn>,
        args: any[],
    ): TData;
    function queueMutation<TFuncReturn extends SortaPromise<TData>>(
        mutatorPath: string,
        func: Mutator<TData, TParamName, TFuncReturn>,
        args: any[],
    ): SortaPromise<TData> {
        log.verbose(`${mutatorPath}(${args}) queued`);

        const operation = buildQueueOperation(mutatorPath, func, args);

        if (isAsyncEncountered) {
            // Queue all operations after the first async is encountered
            queue = queue.then(operation);
        } else {
            const result = operation();
            if (result instanceof Promise) {
                queue = result;
            }

            return result;
        }

        return queue;
    }

    return queueMutation;
};
