import { StoreState } from "state/StoreState";
import { Evolver } from "theseus-js";

export const {} = Evolver.create("StoreEvolver", { noun: "store" })
    .toEvolve<StoreState>()
    .withMutators({
        assignAllStaff: ({ mutableStore }) => {
            return mutableStore;
        },
    });
