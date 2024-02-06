import { Func } from "../../Types/Modifiers";
import { Mutable, MutatorDefs } from "../Types/MutatorTypes";
import { MutatorSet } from "./MutatorSet";

interface Chainable<TData> {
    getFinalForm: () => TData;
}

export class ChainableMutatorSet<
        TEvolverData,
        TParamName extends Mutable<string>,
        TMutators extends MutatorDefs<TEvolverData, TParamName>,
    >
    extends MutatorSet<TEvolverData, TParamName, TMutators>
    implements Chainable<TEvolverData>
{
    private isPromise(value: any): value is Promise<any> {
        return Boolean(value && typeof value.then === "function");
    }

    protected override addFunctionToSelf(context: any, selfPath: string, func: Func) {
        Object.assign(context, {
            [selfPath]: (...args: any[]) => {
                const output = func(this.mutableData, ...args);
                this.mutableData = this.inputToObject<TEvolverData, TParamName>(output);

                return this.isPromise(output) ? output : (
                        {
                            and: this,
                        }
                    );
            },
            lastly: new MutatorSet<TEvolverData, TParamName, TMutators>(
                this.mutableData[this.argName],
                this.argName,
                this.mutators,
            ),
        });
    }

    public getFinalForm() {
        return this.mutableData[this.argName];
    }

    public static createChainable<
        TEvolverData,
        TParamName extends Mutable<string>,
        TMutators extends MutatorDefs<TEvolverData, TParamName>,
    >(data: TEvolverData, argName: TParamName, mutators: TMutators) {
        return new ChainableMutatorSet(data, argName, mutators);
    }

    public static override create(): MutatorSet<any, any, any> {
        throw new Error("ChainableMutatorSet does not support non-chained mutators.");
    }
}
