import { Evolver } from "theseus-js";

interface Data {
    value: number;
}

export const testEvolver = Evolver.create("test", {
	noun: "data",
})
	.toEvolve<Data>()
	.withMutators({
		thing: ({ data }) => data,
		anotherThing: ({ data }) => data,
		lazyThing: async ({ data }) => data,
		lazyAnotherThing: async ({ data }) => data,
	});
