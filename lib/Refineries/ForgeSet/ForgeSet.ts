import { Func } from "../../Types/Modifiers";
import { ExposeForges, ForgeDefs, Immutable } from "../Types/RefineryTypes";

export class ForgeSet<
    TForgeableData,
    TParamName extends Immutable,
    TForges extends ForgeDefs<TForgeableData, TParamName>,
> {
    protected readonly argName: TParamName;
    protected mutableData: { [key in TParamName]: TForgeableData };

    constructor(
        inputData: TForgeableData,
        argName: TParamName,
        forges: TForges,
    ) {
        this.argName = argName;
        this.mutableData = this.inputToObject(inputData);

        this.extendSelfWithForges(forges);
    }

    private extendSelfWithForges(forges: TForges, path: string[] = []) {
        Object.keys(forges).forEach((key) => {
            const item = forges[key];
            const newPath = [...path, key];

            if (typeof item === "function") {
                // Use reduce to traverse and/or build the nested structure
                const lastKey = newPath.pop() as string;
                const context = newPath.reduce((obj, key) => {
                    if (!obj[key]) obj[key] = {};
                    return obj[key];
                }, this as any);

                // Assign the function
                this.addFunctionToSelf(context, lastKey, item);
            } else if (typeof item === "object" && item !== null) {
                // Recursive call for nested objects
                this.extendSelfWithForges(item as TForges, newPath);
            }
        });
    }

    protected addFunctionToSelf(context: any, selfPath: string, func: Func) {
        Object.assign(context, {
            [selfPath]: (...args: any[]) => func(this.mutableData, ...args),
        });
    }

    protected inputToObject<TForgeableData, TParamName extends string>(
        input: TForgeableData,
    ): { [key in TParamName]: TForgeableData } {
        return { [this.argName]: input } as {
            [key in TParamName]: TForgeableData;
        };
    }

    /**
     * Create actions which will use the input provided to the evolver.
     */
    public static create<
        TForgeableData,
        TParamName extends Immutable,
        TForges extends ForgeDefs<TForgeableData, TParamName>,
    >(
        data: TForgeableData,
        argName: TParamName,
        forges: TForges,
    ): ExposeForges<TForgeableData, TParamName, TForges> {
        return new ForgeSet(data, argName, forges) as ExposeForges<
            TForgeableData,
            TParamName,
            TForges
        >;
    }

    public get self() {
        return this;
    }
}
