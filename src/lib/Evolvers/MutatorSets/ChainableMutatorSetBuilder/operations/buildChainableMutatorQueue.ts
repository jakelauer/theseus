import { MutableData, Mutator, SortaPromise } from "@Evolvers/Types";
import getTheseusLogger from "@Shared/Log/getTheseusLogger";
import { Mutable } from "@Shared/String/makeMutable";

const log = getTheseusLogger("Queue");

interface Params<TEvolverData, TParamName extends Mutable<string>> {
    argName: TParamName;
    setMutableData: (data: MutableData<TEvolverData, TParamName>) => void;
    getMutableData: () => MutableData<TEvolverData, TParamName>;
}

export const buildChainableMutatorQueue = <TEvolverData, TParamName extends Mutable>({
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

            if (mutatorResult === undefined || mutatorResult === null) {
                throw new Error(
                    `Mutator ${selfPath} returned ${mutatorResult}. Mutators must return a value compatible with the mutable data type.`,
                );
            }

            if (mutatorResult instanceof Promise) {
                // Async operation encountered, switch to queuing mode
                isAsyncEncountered = true;
                return mutatorResult.then((result) => {
                    if (typeof result !== typeof mutableData[argName]) {
                        throw new Error(
                            `Mutator ${selfPath} returned a value of type ${typeof result} which is not compatible with the mutable data type of ${typeof mutableData[
                                argName
                            ]}.`,
                        );
                    }
                    log.debug(`{ASYNC} ${selfPath} = `, result);
                    setMutableData(inputToObject(result)); // Assuming funcResult updates mutableData
                    return result;
                });
            } else {
                if (typeof mutatorResult !== typeof mutableData[argName]) {
                    throw new Error(
                        `Mutator ${selfPath} returned a value of type ${typeof mutatorResult} which is not compatible with the mutable data type of ${typeof mutableData[
                            argName
                        ]}.`,
                    );
                }
                log.debug(`{SYNC} ${selfPath} = `, mutatorResult);
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

    function queueMutation<TFuncReturn extends Promise<TEvolverData>>(
        mutatorPath: string,
        func: Mutator<TEvolverData, TParamName, TFuncReturn>,
        args: any[],
    ): Promise<TEvolverData>;
    function queueMutation<TFuncReturn extends TEvolverData>(
        mutatorPath: string,
        func: Mutator<TEvolverData, TParamName, TFuncReturn>,
        args: any[],
    ): TEvolverData;
    function queueMutation<TFuncReturn extends SortaPromise<TEvolverData>>(
        mutatorPath: string,
        func: Mutator<TEvolverData, TParamName, TFuncReturn>,
        args: any[],
    ): SortaPromise<TEvolverData> {
        log.debug(`${mutatorPath}(${args}) queued`);

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
