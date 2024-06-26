import { Evolver } from "../Evolver";
import { EvolverComplex } from "../EvolverComplex";

interface DataType{
	count: number;
}

describe("generateEvolveMethods", function() 
{
	it("should support evolvers with both sync and async mutations", function() 
	{
		const complex = EvolverComplex.create().withEvolvers(
			Evolver.create("evolver1", {
				noun: "data",
			}).toEvolve<DataType>().withMutators({
				inner: {
					test: {
						inner2: ({ data }) => data,
					},
				},
				syncIncrement: ({ data }) => ({
					count: data.count + 1, 
				}),
				asyncIncrement: async ({ data }) => ({
					count: data.count + 1, 
				}),
			}),
			Evolver.create("evolver2", {
				noun: "data",
			}).toEvolve<DataType>().withMutators({
				inner: {
					test: {
						inner2: ({ data }) => data,
					},
				},
				syncIncrement: ({ data }) => ({
					count: data.count + 1, 
				}),
			}),
		);

		const input = {
			count: 0, 
		};
		
		const result = complex.__evolvers__;
	});
});
