import log from "@Shared/Log/log";

type Options = {
    /**
     * The maximum time to wait for the promise to resolve, in milliseconds.
     * Default: 60,000 (1 minute)
     */
    timeout?: number;
};

type Outcome<T> = {
    result?: T;
    err?: Error;
    complete: boolean;
};

type AwaitSyncReturnSuccess<T> = [T, undefined];
type AwaitSyncReturnFailure = [undefined, Error];
type AwaitSyncReturn<T> = AwaitSyncReturnSuccess<T> | AwaitSyncReturnFailure;

const isomorphicNextTick =
    typeof process === "object" && typeof process.nextTick === "function" ? process.nextTick
    : typeof window === "object" && typeof window.requestAnimationFrame === "function" ?
        window.requestAnimationFrame
    :   (callback: () => void) => setTimeout(callback, 1000 / 60);

export const AwaitSync = <T>(promise: Promise<T>, options?: Options): AwaitSyncReturn<T> => {
    const timeout = options?.timeout ?? 60 * 1000;
    const now = Date.now();
    const outcome: Outcome<T> = {
        result: undefined,
        err: undefined,
        complete: false,
    };

    let canReturn = false;

    promise
        .then((res) => {
            outcome.result = res;
        })
        .catch((err) => {
            outcome.err = err;
        })
        .finally(() => {
            outcome.complete = true;
        });

    while (!canReturn) {
        isomorphicNextTick(() => {
            const elapsed = Date.now() - now;
            const timedOut = elapsed > timeout;
            if (timedOut) {
                log.error(`Promise timed out after ${timeout}ms`);
                outcome.err = new Error(`Promise timed out after ${timeout}ms`);
            }
            canReturn = outcome.complete || timedOut;
        });
    }

    return [outcome.result, outcome.err] as AwaitSyncReturn<T>;
};
