import { Evolver, EvolverComplex, Refinery, RefineryComplex } from "../lib/index";

export interface MockData {
    touched: boolean;
}

export const mockRefineryComplex = RefineryComplex.create().withRefineries({
    mockRefinery: Refinery.create("mockRefinery", { noun: "mockData" })
        .toRefine<MockData>()
        .withForges({
            getOppositeOfTouched: ({ immutableMockData }) => 
            {
                return !immutableMockData.touched;
            },
        }).mockRefinery,
});

const mockEvolver = Evolver.create("mock", { noun: "mockData" }).toEvolve<MockData>().withMutators({
    toggleTouch: ({ mutableMockData }) => 
    {
        mutableMockData.touched = !mutableMockData.touched;

        return mutableMockData;
    },
});

export const mockEvolverComplex = EvolverComplex.create<MockData>().withEvolvers(mockEvolver);


export const mockEvolverKeyMap = {
    mock: {
        touch: "",
    },
};

export const mockMutatorKeyMap = {
    mock: {
        getOppositeOfTouched: "",
    },
};
