import { expect } from "chai";
import { describe, it } from "mocha";

import { Evolver } from "../../Evolver";

const IncrementEvolverCreator = () =>
    Evolver.create("IncrementEvolver", {
        noun: "amount",
    })
        .toEvolve<{ count: number }>()
        .withMutators({
            increment: ({ mutableAmount }, amount: number) => {
                return {
                    count: mutableAmount.count + amount,
                };
            },
        });

type IncrementEvolver = ReturnType<typeof IncrementEvolverCreator>["IncrementEvolver"];

describe("EvolverComplex", () => {
    let IncrementEvolver: IncrementEvolver;

    before(function () {
        // Define a simple increment Evolver for demonstration purposes
        const { IncrementEvolver: recreatedIncremementEvolver } = IncrementEvolverCreator();

        IncrementEvolver = recreatedIncremementEvolver;
    });

    describe("create and setup evolvers", () => {
        it("should initialize and setup evolvers correctly, separating creation from execution", () => {
            // Creation step: Define the structure of the complex evolver
            const { IncrementEvolver } = IncrementEvolverCreator();

            // Ensure the setup contains methods indicative of a successful setup
            expect(IncrementEvolver).to.have.property("mutate").that.is.a("function");
            expect(IncrementEvolver).to.have.property("evolve").that.is.a("function");

            // This confirms that the setup phase not only occurs but results in an object ready for execution phases.
        });
    });

    describe("execute mutations", () => {
        it("should execute a single mutation correctly", () => {
            // Execute step: Use the setup to perform mutations
            const initialData = { count: 0 };
            const mutationResult = IncrementEvolver.mutate(initialData).using.increment(5);

            expect(mutationResult.count).to.equal(5);
        });

        it("should execute chained mutations correctly", () => {
            const initialData = { count: 10 };

            // Chained execution: Demonstrates the use of the same setup for multiple operations
            const evolvedResult = IncrementEvolver.evolve(initialData)
                .using.increment(5)
                .then.increment(10)
                .then.finally.increment(10);

            expect(evolvedResult.count).to.equal(35);
        });
    });
});
