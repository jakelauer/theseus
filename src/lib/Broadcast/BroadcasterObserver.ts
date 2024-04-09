import { getTheseusLogger } from "@Shared/index";

const log = getTheseusLogger("BroadcasterObserver");

const isomorphicNextTick = (fn: () => void) => 
{
    if (typeof window === "undefined") 
    {
        process.nextTick(fn);
    }
    else 
    {
        requestAnimationFrame(fn);
    }
};

export class BroadcasterObserver<TData extends object> 
{
    public readonly callback: (newData: TData) => void;

    constructor(callback: (newData: TData) => void) 
    {
        this.callback = callback;
    }

    public update(newData: TData) 
    {
        return new Promise<void>((resolve, reject) =>
            isomorphicNextTick(() => 
            {
                log.verbose("Updating observer");
                try 
                {
                    this.callback(newData);
                }
                catch (e) 
                {
                    reject(e);
                }
                resolve();
            }),
        );
    }
}

export interface CustomObserverClass<TData extends object, ConstructorType> {
    new (callback: (newData: TData) => void): ConstructorType;
}
