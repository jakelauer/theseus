import { expect } from "chai";
import { describe, it } from "mocha";

import { Evolver } from "../Evolver";

describe("Evolvers", () => 
{
    // Mock data and types for testing
    interface TestData {
        value: number;
    }

    const testEvolver = Evolver.create("testEvolver")
    	.toEvolve<TestData>()
    	.withMutators({
    		increment: ({ input }) => ({ value: input.value + 1 }),
    		decrement: ({ input }) => ({ value: input.value - 1 }),
    	});

    const preMutatorTestEvolver = Evolver.create("testEvolver").toEvolve<TestData>();
    type MutatorType = Parameters<(typeof preMutatorTestEvolver)["withMutators"]>[0];

    const testMutators = {
    	increment: ({ input }) => ({ value: input.value + 1 }),
    	decrement: ({ input }) => ({ value: input.value - 1 }),
    } satisfies MutatorType;

    describe("Factory Method and Initialization", () => 
    {
    	const evolverName = "testEvolver";

    	it("should create an Evolver instance with the correct name and mutators", () => 
    	{
    		const testEvolver = preMutatorTestEvolver.withMutators(testMutators);

    		expect(testEvolver).to.be.an.instanceof(Evolver);
    		expect(testEvolver.getMutatorDefinitions()).to.deep.equal(testMutators);
    	});
    });

    describe("Builder Function", () => 
    {
    	it("should support fluent configuration and creation of an Evolver instance", () => 
    	{
    		const evolverName = "testEvolver";
    		const evolver = Evolver.buildCreator().toEvolve<TestData>().named(evolverName).withMutators(testMutators);

    		expect(evolver).to.be.an.instanceof(Evolver);
    	});
    });

    describe("Mutator Access", () => 
    {
    	it("should return the correct set of mutators", () => 
    	{
    		const testEvolver = preMutatorTestEvolver.withMutators(testMutators);
    		expect(testEvolver.getMutatorDefinitions()).to.deep.equal(testMutators);
    	});
    });

    describe("Evolver Advanced Usage", () => 
    {
    	const evolverName = "advancedEvolver";
        interface AnotherTestData {
            name: string;
        }

        describe("Error Handling", () => 
        {
        	it("should handle invalid mutator definitions gracefully", () => 
        	{
        		// Assuming there's some form of validation on mutators, which there might not be.
        		// This is speculative and should be adapted to the actual error handling strategy of Evolver.
        		const invalidMutators: any = { brokenMutator: null }; // Intentionally incorrect

        		expect(() =>
        			Evolver.create("testEvolver").toEvolve<AnotherTestData>().withMutators(invalidMutators),
        		).to.throw(); // Specify the expected error or message
        	});
        });

        describe("Immutable return", () => 
        {
        	it("should return the same object which can be further evolved", () => 
        	{
        		const testEvolver = Evolver.create("testEvolver")
        			.toEvolve<TestData>()
        			.withMutators({
        				increment: ({ input }, by: number) =>
        				{ 
        					return { value: input.value + by };
        				},
        			});

        		const initialData = { value: 1 };

        		const initialDataEvolver = testEvolver.evolve(initialData);

        		// Evolve the initial data from 1 to 2
        		const evolvedData = initialDataEvolver.via.increment(1).end();
        		expect(evolvedData.value).to.equal(2); // The evolved data should be 2

        		// Create a second copy of the evolved data and evolve it again
        		const reEvolvedData = initialDataEvolver.via.increment(2).end();
        		expect(reEvolvedData).to.equal(evolvedData, "The new evolved data should be the same object");
        		expect(evolvedData.value).to.equal(4, "The original evolved data should be changed");
        		expect(reEvolvedData.value).to.equal(4);

        		// Directly edit the evolved data manually
        		expect(() => 
        		{
        			reEvolvedData.value = 5;
        		}).to.throw("Cannot modify property \"value\" of the original object."); // The new evolved data should remain unchanged
        	});
        });

        describe("Usage with Different Data Types", () => 
        {
        	it("should work with different data structures", () => 
        	{
        		const stringEvolver = Evolver.create("string")
        			.toEvolve<AnotherTestData>()
        			.withMutators({
        				rename: ({ input }) => ({ name: `New ${input.name}` }),
        			});

        		expect(stringEvolver).to.be.an.instanceof(Evolver);
        	});
        });

        describe("Complex Mutator Functions", () => 
        {
        	// Testing with more complex mutator functions that might involve asynchronous operations,
        	// side effects, etc.
        	it("should support complex mutator definitions", async () => 
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
        	});
        });

        describe("Evolver with async chained mutators", () => 
        {
        	it("should support async chained mutators", async () => 
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

        		const resultA = await AsyncEvolver.evolve({ name: "1234" })
        			.via.asyncMakeNameLowerCase()
        			.and.asyncMakeNameUpperCase()
        			.and.asyncReverseName()
        			.lastly.syncReplaceVowels();
        		expect(resultA.name).to.equal("4321");

        		const resultB = await AsyncEvolver.evolve({ name: "test" })
        			.via.syncReplaceVowels()
        			.and.asyncMakeNameUpperCase()
        			.lastly.asyncReverseName();

        		expect(resultB.name).to.equal("TS*T");

        		return;
        	});
        });
    });
});
