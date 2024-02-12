import { expect } from "chai";
import { describe, it } from "mocha";

import { Evolver } from "../";

describe("Evolver", () => {
    // Mock data and types for testing
    interface TestData {
        value: number;
    }

    const _evolver = Evolver.create("testEvolver").toEvolve<TestData>();
    type TestEvolverMutators = Parameters<(typeof _evolver)["withMutators"]>;

    const testMutators: TestEvolverMutators[0] = {
        increment: ({ mutableData }) => ({ value: mutableData.value + 1 }),
    };

    describe("Factory Method and Initialization", () => {
        const evolverName = "testEvolver";

        it("should create an Evolver instance with the correct name and mutators", () => {
            const evolver = Evolver.create(evolverName).toEvolve<TestData>().withMutators(testMutators)[evolverName];

            expect(evolver).to.be.an.instanceof(Evolver);
            expect(evolver.getMutators()).to.deep.equal(testMutators);
        });
    });

    describe("Builder Function", () => {
        it("should support fluent configuration and creation of an Evolver instance", () => {
            const evolverName = "testEvolver";
            const evolver = Evolver.buildCreator().toEvolve<TestData>().named(evolverName).withMutators(testMutators)[
                evolverName
            ];

            expect(evolver).to.be.an.instanceof(Evolver);
        });
    });

    describe("Mutator Access", () => {
        it("should return the correct set of mutators", () => {
            const evolverName = "testEvolver";
            const evolver = Evolver.create(evolverName).toEvolve<TestData>().withMutators(testMutators)[evolverName];
            expect(evolver.getMutators()).to.deep.equal(testMutators);
        });
    });

    describe("Evolver Advanced Usage", () => {
        const evolverName = "advancedEvolver";
        interface AnotherTestData {
            name: string;
        }

        const _evolver = Evolver.create("testEvolver").toEvolve<AnotherTestData>();
        type TestEvolverMutators = Parameters<(typeof _evolver)["withMutators"]>;

        const anotherTestMutators: TestEvolverMutators[0] = {
            rename: ({ mutableData }) => ({ name: `New ${mutableData.name}` }),
        };

        describe("Error Handling", () => {
            it("should handle invalid mutator definitions gracefully", () => {
                // Assuming there's some form of validation on mutators, which there might not be.
                // This is speculative and should be adapted to the actual error handling strategy of Evolver.
                const invalidMutators: any = { brokenMutator: null }; // Intentionally incorrect

                expect(
                    () =>
                        Evolver.create(evolverName).toEvolve<AnotherTestData>().withMutators(invalidMutators)[
                            evolverName
                        ],
                ).to.throw(); // Specify the expected error or message
            });
        });

        describe("Usage with Different Data Types", () => {
            it("should work with different data structures", () => {
                const { stringEvolver } = Evolver.create("stringEvolver")
                    .toEvolve<AnotherTestData>()
                    .withMutators(anotherTestMutators);

                expect(stringEvolver).to.be.an.instanceof(Evolver);
            });
        });

        describe("Fluent API Integration", () => {
            it("should allow for chaining of configurations and methods seamlessly", () => {
                // Demonstrates chaining beyond simple creation, assuming such capabilities exist or make sense for the Evolver design
                const chainedEvolver = Evolver.create(evolverName)
                    .toEvolve<AnotherTestData>()
                    .withMutators(anotherTestMutators)[evolverName];
                // Further chaining could include method calls that configure or use the Evolver instance

                expect(chainedEvolver).to.be.an.instanceof(Evolver);
                // Assertions to verify the results of the chained calls
            });
        });

        describe("Complex Mutator Functions", () => {
            // Testing with more complex mutator functions that might involve asynchronous operations, side effects, etc.
            it("should support complex mutator definitions", async () => {
                // Example of an async mutator, if supported by the design
                const asyncMutators: TestEvolverMutators[0] = {
                    asyncIncrement: async ({ mutableData }) => ({ name: mutableData.name + "1" }),
                };

                const evolver = Evolver.create("asyncEvolver")
                    .toEvolve<AnotherTestData>()
                    .withMutators(asyncMutators).asyncEvolver;

                // Assuming Evolver or mutators can handle async operations, use async/await or promises as needed
                expect(evolver).to.be.an.instanceof(Evolver);
            });
        });
    });
});
