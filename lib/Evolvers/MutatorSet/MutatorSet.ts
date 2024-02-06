import { Func } from "../../Types/Modifiers";
import { Mutable, MutatorDefs } from "../Types/MutatorTypes";

export class MutatorSet<
    TEvolverData,
    TParamName extends Mutable<string>,
    TMutators extends MutatorDefs<TEvolverData, TParamName>,
> {
    protected mutableData: { [key in TParamName]: TEvolverData };

    constructor(
        inputData: TEvolverData,
        protected readonly argName: TParamName,
        protected readonly mutators: TMutators,
    ) {
        this.mutableData = this.inputToObject(inputData);

        this.extendSelfWithMutators(mutators);
    }

    private extendSelfWithMutators(mutators: TMutators, path: string[] = []) {
        Object.keys(mutators).forEach((mutatorKey) => {
            const item = mutators[mutatorKey];
            const newPath = [...path, mutatorKey];

            if (typeof item === "function") {
                // Use reduce to traverse and/or build the nested structure
                const lastKey = newPath.pop() as string;
                const context = newPath.reduce((obj, key) => {
                    if (!obj[key]) obj[key] = {};
                    return obj[key];
                }, this as any);

                // Assign the function
                if (Object.prototype.hasOwnProperty.call(context, lastKey)) {
                    throw new Error(
                        `Property '${lastKey}' already exists on evolver. 
						You may have a duplicate mutator name, or you may be trying to overwrite a built-in evolver function.`,
                    );
                }

                this.addFunctionToSelf(context, lastKey, item);
            } else if (typeof item === "object" && item !== null) {
                // Recursive call for nested objects
                this.extendSelfWithMutators(item as TMutators, newPath);
            }
        });
    }

    protected addFunctionToSelf(context: any, selfPath: string, func: Func) {
        Object.assign(context, {
            [selfPath]: (...args: any[]) => func(this.mutableData, ...args),
        });
    }

    protected inputToObject<_TEvolverData, _TParamName extends Mutable<string>>(
        input: _TEvolverData,
    ): { [key in _TParamName]: _TEvolverData } {
        return { [this.argName]: input } as {
            [key in _TParamName]: _TEvolverData;
        };
    }

    public static create<
        TEvolverData,
        TParamName extends Mutable<string>,
        TMutators extends MutatorDefs<TEvolverData, TParamName>,
    >(data: TEvolverData, argName: TParamName, mutators: TMutators): MutatorSet<TEvolverData, TParamName, TMutators> {
        return new MutatorSet(data, argName, mutators);
    }
}
