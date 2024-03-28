import { expect } from "chai";
import { describe, it } from "mocha";

import { Evolver } from "../Evolver";

describe("Evolvers", () => {
    // Mock data and types for testing
    interface TestData {
        value: number;
    }

    const { testEvolver } = Evolver.create("testEvolver")
        .toEvolve<TestData>()
        .withMutators({
            increment: ({ mutableInput }) => ({ value: mutableInput.value + 1 }),
            decrement: ({ mutableInput }) => ({ value: mutableInput.value - 1 }),
        });

    const preMutatorTestEvolver = Evolver.create("testEvolver").toEvolve<TestData>();
    type MutatorType = Parameters<(typeof preMutatorTestEvolver)["withMutators"]>[0];

    const testMutators = {
        increment: ({ mutableInput }) => ({ value: mutableInput.value + 1 }),
        decrement: ({ mutableInput }) => ({ value: mutableInput.value - 1 }),
    } satisfies MutatorType;

    describe("Factory Method and Initialization", () => {
        const evolverName = "testEvolver";

        it("should create an Evolver instance with the correct name and mutators", () => {
            const { testEvolver } = preMutatorTestEvolver.withMutators(testMutators);

            expect(testEvolver).to.be.an.instanceof(Evolver);
            expect(testEvolver.getMutatorDefinitions()).to.deep.equal(testMutators);
        });
    });

    describe("Builder Function", () => {
        it("should support fluent configuration and creation of an Evolver instance", () => {
            const evolverName = "testEvolver";
            const evolver = Evolver.buildCreator()
                .toEvolve<TestData>()
                .named(evolverName)
                .withMutators(testMutators)[evolverName];

            expect(evolver).to.be.an.instanceof(Evolver);
        });
    });

    describe("Mutator Access", () => {
        it("should return the correct set of mutators", () => {
            const { testEvolver } = preMutatorTestEvolver.withMutators(testMutators);
            expect(testEvolver.getMutatorDefinitions()).to.deep.equal(testMutators);
        });
    });

    describe("Evolver Advanced Usage", () => {
        const evolverName = "advancedEvolver";
        interface AnotherTestData {
            name: string;
        }

        describe("Error Handling", () => {
            it("should handle invalid mutator definitions gracefully", () => {
                // Assuming there's some form of validation on mutators, which there might not be.
                // This is speculative and should be adapted to the actual error handling strategy of Evolver.
                const invalidMutators: any = { brokenMutator: null }; // Intentionally incorrect

                expect(() =>
                    Evolver.create("testEvolver").toEvolve<AnotherTestData>().withMutators(invalidMutators),
                ).to.throw(); // Specify the expected error or message
            });
        });

        describe("Immutable return", () => {
            it("should return a new object copy that won't change after further evolutions", () => {
                const { testEvolver } = Evolver.create("testEvolver")
                    .toEvolve<TestData>()
                    .withMutators({
                        increment: ({ mutableInput }) => ({ value: mutableInput.value + 1 }),
                    });

                const initialData = { value: 1 };

                const initialDataEvolver = testEvolver.evolve(initialData);

                console.log("Evolving first time");

                // Evolve the initial data from 1 to 2
                const evolvedData = initialDataEvolver.using.increment().finalForm;
                expect(evolvedData.value).to.equal(2); // The evolved data should be 2

                console.log("Evolving second time");

                // Create a second copy of the evolved data and evolve it again
                const reEvolvedData = initialDataEvolver.using.increment().finalForm;
                console.log("Re-evolved data", reEvolvedData);
                expect(evolvedData.value).to.equal(2); // The original evolved data should remain unchanged
                expect(reEvolvedData.value).to.equal(3); // The new evolved data should be 3

                console.log("Evolving third time");
                // Directly edit the evolved data manually
                evolvedData.value = 5;
                expect(evolvedData.value).to.equal(5); // The evolved data should be 5 after manual editing
                expect(reEvolvedData.value).to.equal(3); // The new evolved data should remain 3
            });
        });

        describe("Usage with Different Data Types", () => {
            it("should work with different data structures", () => {
                const { stringEvolver } = Evolver.create("stringEvolver")
                    .toEvolve<AnotherTestData>()
                    .withMutators({
                        rename: ({ mutableInput }) => ({ name: `New ${mutableInput.name}` }),
                    });

                expect(stringEvolver).to.be.an.instanceof(Evolver);
            });
        });

        describe("Complex Mutator Functions", () => {
            // Testing with more complex mutator functions that might involve asynchronous operations, side effects, etc.
            it("should support complex mutator definitions", async () => {
                // Example of an async mutator, if supported by the design
                const evolver = Evolver.create("asyncEvolver")
                    .toEvolve<AnotherTestData>()
                    .withMutators({
                        asyncIncrement: async ({ mutableInput }) => ({
                            name: mutableInput.name + "1",
                        }),
                    }).asyncEvolver;

                // Assuming Evolver or mutators can handle async operations, use async/await or promises as needed
                expect(evolver).to.be.an.instanceof(Evolver);
            });
        });

        describe("Evolver with async chained mutators", () => {
            it("should support async chained mutators", async () => {
                const { AsyncEvolver } = Evolver.create("AsyncEvolver")
                    .toEvolve<AnotherTestData>()
                    .withMutators({
                        asyncMakeNameUpperCase: async ({ mutableInput }) => {
                            const result = await new Promise<AnotherTestData>((resolve) => {
                                setTimeout(() => {
                                    mutableInput.name = mutableInput.name.toUpperCase();
                                    resolve(mutableInput);
                                }, 100);
                            });

                            return result;
                        },
                        asyncMakeNameLowerCase: async ({ mutableInput }) => {
                            const result = await new Promise<AnotherTestData>((resolve) => {
                                setTimeout(() => {
                                    mutableInput.name = mutableInput.name.toLowerCase();
                                    resolve(mutableInput);
                                }, 100);
                            });

                            return result;
                        },
                        asyncReverseName: async ({ mutableInput }) => {
                            const result = await new Promise<AnotherTestData>((resolve) => {
                                setTimeout(() => {
                                    mutableInput.name = mutableInput.name.split("").reverse().join("");
                                    resolve(mutableInput);
                                }, 100);
                            });

                            return result;
                        },
                        syncReplaceVowels: ({ mutableInput }) => ({
                            name: mutableInput.name.replace(/[aeiou]/gi, "*"),
                        }),
                    });

                console.log("Result A");
                const resultA = await AsyncEvolver.evolve({ name: "test" })
                    .using.asyncMakeNameLowerCase()
                    .then.asyncMakeNameUpperCase()
                    .then.asyncReverseName()
                    .finally.syncReplaceVowels();

                console.log("Result B");
                const resultB = await AsyncEvolver.evolve({ name: "test" })
                    .using.syncReplaceVowels()
                    .then.asyncMakeNameUpperCase()
                    .finally.asyncReverseName();

                expect(resultA.name).to.equal("TS*T");
                expect(resultB.name).to.equal("TS*T");
            });
        });
    });
});
