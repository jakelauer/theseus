import { Func } from "../../Types/Modifiers";
import { Mutable, MutatorDefs } from "../Types/MutatorTypes";
import { MutatorSet } from "./MutatorSet";

interface Chainable<TEvolverData> {
    getFinalForm: () => TEvolverData;
}

export class AsyncChainableMutatorSet<
        TEvolverData,
        TParamName extends Mutable<string>,
        TMutators extends MutatorDefs<TEvolverData, TParamName>,
    >
    extends MutatorSet<TEvolverData, TParamName, TMutators>
    implements Chainable<TEvolverData>
{
    protected override addFunctionToSelf(context: any, selfPath: string, func: Func) {
        Object.assign(context, {
            [selfPath]: async (...args: any[]) => {
                const output = (await func(this.mutableData, ...args)) as TEvolverData;
                this.mutableData = this.inputToObject<TEvolverData, TParamName>(output);

                return this;
            },
        });
    }

    public getFinalForm() {
        return this.mutableData[this.argName];
    }

    public static createAsync<
        TEvolverData,
        TParamName extends Mutable<string>,
        TMutators extends MutatorDefs<TEvolverData, TParamName>,
    >(
        data: TEvolverData,
        argName: TParamName,
        mutators: TMutators,
    ): AsyncChainableMutatorSet<TEvolverData, TParamName, TMutators> {
        return new AsyncChainableMutatorSet(data, argName, mutators);
    }

    public static override create(): MutatorSet<any, any, any> {
        throw new Error("AsyncChainableMutatorSet does not support non-chained mutators.");
    }
}
