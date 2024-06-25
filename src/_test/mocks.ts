import {
	Evolver, EvolverComplex, Refinery, RefineryComplex, 
} from "../lib";

export interface MockData {
    touched: boolean;
}

export const mockRefineryComplex = RefineryComplex.create().withRefineries(
	Refinery.create("mockRefinery", {
		noun: "mockData", 
	})
		.toRefine<MockData>()
		.withForges({
			getOppositeOfTouched: ({ mockData }) => 
			{
				return !mockData.touched;
			},
		}),
);

const mockEvolver = Evolver.create("mock", {
	noun: "mockData", 
}).toEvolve<MockData>().withMutators({
	toggleTouch: ({ mockData }) => 
	{
		mockData.touched = !mockData.touched;

		return mockData;
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
