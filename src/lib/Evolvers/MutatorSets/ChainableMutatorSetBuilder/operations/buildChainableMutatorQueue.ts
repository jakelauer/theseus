import log from "loglevel";

import { MutableData, Mutator, SortaPromise } from "@Evolvers/Types";
import { Mutable } from "@Shared/String/makeMutable";

interface Params<TEvolverData, TParamName extends Mutable<string>> {
    argName: TParamName;
    setMutableData: (data: MutableData<TEvolverData, TParamName>) => void;
    getMutableData: () => MutableData<TEvolverData, TParamName>;
}

export const buildChainableMutatorQueue = <TEvolverData, TParamName extends Mutable<string>>({
    argName,
    getMutableData,
    setMutableData,
}: Params<TEvolverData, TParamName>) => {
    let isAsyncEncountered = false;
    let queue: Promise<any> = Promise.resolve();

    const buildQueueOperation = (
        selfPath: string,
        mutator: Mutator<TEvolverData, TParamName, SortaPromise<TEvolverData>>,
        args: any[],
    ) => {
        return () => {
            const mutableData = getMutableData();
            const mutatorResult = mutator(mutableData, ...args);

            if (mutatorResult === undefined) {
                log.error(
                    `[Operation] "${selfPath}()" returned undefined. This is likely an error.`,
                );
            }

            if (mutatorResult instanceof Promise) {
                // Async operation encountered, switch to queuing mode
                isAsyncEncountered = true;
                return mutatorResult.then((result) => {
                    log.debug(
                        `[Operation] "${selfPath}()" completed, updating mutable data`,
                        result,
                    );
                    setMutableData(inputToObject(result)); // Assuming funcResult updates mutableData
                    return result;
                });
            } else {
                log.debug(
                    `[Operation] "${selfPath}()" completed, updating mutable data`,
                    mutatorResult,
                );
                setMutableData(inputToObject(mutatorResult)); // Assuming funcResult updates mutableData
                return mutatorResult;
            }
        };
    };

    const inputToObject = (input: TEvolverData): { [key in TParamName]: TEvolverData } => {
        return { [argName]: input } as {
            [key in TParamName]: TEvolverData;
        };
    };

    const queueMutation = (
        mutatorPath: string,
        func: Mutator<TEvolverData, TParamName, SortaPromise<TEvolverData>>,
        args: any[],
    ) => {
        log.debug(`[Operation] Queuing operation "${mutatorPath}" with args: `, args);

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
    };

    return queueMutation;
};
