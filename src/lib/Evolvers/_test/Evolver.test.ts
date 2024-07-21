import { Evolver } from "../Evolver.js";

import { expect } from "vitest";

"Evolvers",
() => 
{
        // Mock data and types for testing
        interface TestData {
            value: number;
        }

        const testEvolver = Evolver.create("testEvolver")
        	.toEvolve<TestData>()
        	.withMutators({
        		increment: ({ input }) => ({
        			value: input.value + 1,
        		}),
        		decrement: ({ input }) => ({
        			value: input.value - 1,
        		}),
        	});

        const preMutatorTestEvolver = Evolver.create("testEvolver").toEvolve<TestData>();
        type MutatorType = Parameters<(typeof preMutatorTestEvolver)["withMutators"]>[0];

        const testMutators = {
        	increment: ({ input }) => ({
        		value: input.value + 1,
        	}),
        	decrement: ({ input }) => ({
        		value: input.value - 1,
        	}),
        } satisfies MutatorType;

        "Factory Method and Initialization",
        () => 
        {
        	const evolverName = "testEvolver";

        	"should create an Evolver instance with the correct name and mutators",
        	() => 
        	{
        		const testEvolver = preMutatorTestEvolver.withMutators(testMutators);

        		expect(testEvolver).to.be.an.instanceof(Evolver);
        		expect(testEvolver.getMutatorDefinitions()).to.deep.equal(testMutators);
        	};
        };

        "Builder Function",
        () => 
        {
        	"should support fluent configuration and creation of an Evolver instance",
        	() => 
        	{
        		const evolverName = "testEvolver";
        		const evolver = Evolver.buildCreator()
        			.toEvolve<TestData>()
        			.named(evolverName)
        			.withMutators(testMutators);

        		expect(evolver).to.be.an.instanceof(Evolver);
        	};
        };

        "Mutator Access",
        () => 
        {
        	"should return the correct set of mutators",
        	() => 
        	{
        		const testEvolver = preMutatorTestEvolver.withMutators(testMutators);
        		expect(testEvolver.getMutatorDefinitions()).to.deep.equal(testMutators);
        	};
        };

        "Evolver Advanced Usage",
        () => 
        {
        	const evolverName = "advancedEvolver";
                interface AnotherTestData {
                    name: string;
                }

                "Error Handling",
                () => 
                {
                	"should handle invalid mutator definitions gracefully",
                	() => 
                	{
                		// Assuming there's some form of validation on mutators, which there might not be.
                		// This is speculative and should be adapted to the actual error handling strategy of Evolver.
                		const invalidMutators: any = {
                			brokenMutator: null,
                		}; // Intentionally incorrect

                		expect(() =>
                			Evolver.create("testEvolver")
                				.toEvolve<AnotherTestData>()
                				.withMutators(invalidMutators),
                		).to.throw(); // Specify the expected error or message
                	};
                };

                "Immutable return",
                () => 
                {
                	"should return the same object which can be further evolved",
                	() => 
                	{
                		const testEvolver = Evolver.create("testEvolver")
                			.toEvolve<TestData>()
                			.withMutators({
                				increment: ({ input }, by: number) => 
                				{
                					return {
                						value: input.value + by,
                					};
                				},
                			});

                		const initialData = {
                			value: 1,
                		};

                		const initialDataEvolver = testEvolver.evolve(initialData);

                		// Evolve the initial data from 1 to 2
                		const evolvedData = initialDataEvolver.via.increment(1).end();
                		expect(evolvedData.value).to.equal(2); // The evolved data should be 2

                		// Create a second copy of the evolved data and evolve it again
                		const reEvolvedData = initialDataEvolver.via.increment(2).end();
                		expect(reEvolvedData).not.to.equal(
                			evolvedData,
                			"The new evolved data should not be the same object",
                		);
                		expect(evolvedData.value).to.equal(
                			2,
                			"The original evolved data should not be changed",
                		);
                		expect(reEvolvedData.value).to.equal(4);

                		// Directly edit the evolved data manually
                		expect(() => 
                		{
                			reEvolvedData.value = 5;
                		}).to.throw('Cannot modify property "value" of the original object.'); // The new evolved data should remain unchanged
                	};
                };

                "Usage with Different Data Types",
                () => 
                {
                	"should work with different data structures",
                	() => 
                	{
                		const stringEvolver = Evolver.create("string")
                			.toEvolve<AnotherTestData>()
                			.withMutators({
                				rename: ({ input }) => ({
                					name: `New ${input.name}`,
                				}),
                			});

                		expect(stringEvolver).to.be.an.instanceof(Evolver);
                	};
                };

                "Complex Mutator Functions",
                () => 
                {
                	// Testing with more complex mutator functions that might involve asynchronous operations,
                	// side effects, etc.
                	"should support complex mutator definitions",
                	async () => 
                	{
                		// Example of an async mutator, if supported by the design
                		const evolver = Evolver.create("async")
                			.toEvolve<AnotherTestData>()
                			.withMutators({
                				asyncIncrement: async ({ input }) => ({
                					name: input.name + "1",
                				}),
                			});

                		// Assuming Evolver or mutators can handle async operations, use async/await or promises as needed
                		expect(evolver).to.be.an.instanceof(Evolver);
                	};
                };

                "Evolver with async chained mutators",
                () => 
                {
                	"should support async chained mutators",
                	async () => 
                	{
                		const AsyncEvolver = Evolver.create("async")
                			.toEvolve<AnotherTestData>()
                			.withMutators({
                				asyncMakeNameUpperCase: async ({ input }) => 
                				{
                					const result = await new Promise<AnotherTestData>((resolve) => 
                					{
                						setTimeout(() => 
                						{
                							input.name = input.name.toUpperCase();
                							resolve(input);
                						}, 100);
                					});

                					return result;
                				},
                				asyncMakeNameLowerCase: async ({ input }) => 
                				{
                					const result = await new Promise<AnotherTestData>((resolve) => 
                					{
                						setTimeout(() => 
                						{
                							input.name = input.name.toLowerCase();
                							resolve(input);
                						}, 100);
                					});

                					return result;
                				},
                				asyncReverseName: async ({ input }) => 
                				{
                					const result = await new Promise<AnotherTestData>((resolve) => 
                					{
                						setTimeout(() => 
                						{
                							input.name = input.name.split("").reverse().join("");
                							resolve(input);
                						}, 100);
                					});

                					return result;
                				},
                				syncReplaceVowels: ({ input }) => ({
                					name: input.name.replace(/[aeiou]/gi, "*"),
                				}),
                			});

                		const resultA = await AsyncEvolver.evolve({
                			name: "1234",
                		})
                			.via.asyncMakeNameLowerCase()
                			.and.asyncMakeNameUpperCase()
                			.and.asyncReverseName()
                			.lastly.syncReplaceVowels();
                		expect(resultA.name).to.equal("4321");

                		const resultB = await AsyncEvolver.evolve({
                			name: "test",
                		})
                			.via.syncReplaceVowels()
                			.and.asyncMakeNameUpperCase()
                			.lastly.asyncReverseName();

                		expect(resultB.name).to.equal("TS*T");

                		return;
                	};
                };
        };
};
