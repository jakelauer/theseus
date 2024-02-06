import { Func } from "../../Types/Modifiers";
import { Mutable, MutatorDefs } from "../Types/MutatorTypes";
import { MutatorSet } from "./MutatorSet";

export class AsyncMutatorSet<
    TEvolverData,
    TParamName extends Mutable<string>,
    TMutators extends MutatorDefs<TEvolverData, TParamName>,
> extends MutatorSet<TEvolverData, TParamName, TMutators> {
    protected override mutableData: { [key in TParamName]: TEvolverData };

    constructor(
        inputData: TEvolverData,
        protected override readonly argName: TParamName,
        functionObject: TMutators,
    ) {
        super(inputData, argName, functionObject);

        this.mutableData = this.inputToObject(inputData);
    }

    protected override addFunctionToSelf(context: any, selfPath: string, func: Func) {
        Object.assign(context, {
            [selfPath]: async (...args: any[]) => await func(this.mutableData, ...args),
        });
    }

    /**
     * Create actions which will use the input provided to the evolver.
     */
    public static createAsync<
        TEvolverData,
        TParamName extends Mutable<string>,
        TMutators extends MutatorDefs<TEvolverData, TParamName>,
    >(data: TEvolverData, argName: TParamName, mutators: TMutators): MutatorSet<TEvolverData, TParamName, TMutators> {
        return new AsyncMutatorSet(data, argName, mutators);
    }

    public static override create(): MutatorSet<any, any, any> {
        throw new Error("AsyncMutatorSet does not support non-async mutators.");
    }
}
