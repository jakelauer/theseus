import { Evolver } from "../Evolver.js";
import {
	describe, expect, it, 
} from "vitest";
import { EvolverComplex } from "../EvolverComplex.js";

interface DataType {
    count: number;
}

describe("generateEvolveMethods", function () 
{
	it("should support evolvers with both sync and async mutations", async function () 
	{
		const complex = EvolverComplex.create().withEvolvers(
			Evolver.create("evolver1", {
				noun: "data",
			})
				.toEvolve<DataType>()
				.withMutators({
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
			})
				.toEvolve<DataType>()
				.withMutators({
					inner2: ({ data }) => data,
					syncIncrement: ({ data }) => ({
						count: data.count + 1,
					}),
				}),
		);

		const input = {
			count: 0,
		};

		const result = complex.evolve({
			count: 0,
		}).evolver2.syncIncrement()
			.lastly.inner2();
		
		expect(result).to.deep.equal({
			count: 1,
		});

		const result2 = await complex.evolve({
			count: 0,
		})
			.evolver1.asyncIncrement()
			.endAsync();
		
		expect(result2).to.deep.eq({
			count: 1, 
		});
	});
});
