import { expect } from "chai";

import { Refinery } from "../Refinery";

describe("Refinery", function () 
{
    interface TestData {
        field: string;
    }

    const refineryDefinition = {
        noun: "testData",
    } as const;

    it("should create a refinery with the correct name", function () 
    {
        const output = Refinery.create("testRefinery", refineryDefinition)
            .toRefine<TestData>()
            .withForges({
                forge1: ({ immutableTestData }) => ({
                    ...immutableTestData,
                    field: immutableTestData.field.toUpperCase(),
                }),
            });
        expect(Object.keys(output)[0]).to.equal("testRefinery");
    });

    it("should apply forge functions correctly", function () 
    {
        const { testRefinery } = Refinery.create("testRefinery", refineryDefinition)
            .toRefine<TestData>()
            .withForges({
                forge1: ({ immutableTestData }) => ({
                    ...immutableTestData,
                    field: immutableTestData.field.toUpperCase(),
                }),
            });
        const testData: TestData = { field: "test" };
        const result = testRefinery(testData).forge1(); // Assuming `applyForges` is a method to apply forges
        expect(result.field).to.equal("TEST");
    });

    it("should throw an error if a forge function modifies the immutable data", function () 
    {
        const { testRefinery } = Refinery.create("testRefinery", refineryDefinition)
            .toRefine<TestData>()
            .withForges({
                forge1: ({ immutableTestData }) => 
                {
                    immutableTestData.field = immutableTestData.field.toUpperCase();
                    return immutableTestData;
                },
            });
        const testData: TestData = { field: "test" };

        // This checks if the environment is strict, because in strict mode,
        // the assignment to the immutable property will throw a TypeError,
        // and in non-strict mode, the assignment will fail silently.
        const isStrict = (function () 
        {
            return !this;
        })();

        if (isStrict) 
        {
            expect(() => testRefinery(testData).forge1()).to.throw(
                TypeError,
                /^Cannot assign to read only property/,
            );
        }
        else 
        {
            expect(() => testRefinery(testData).forge1()).to.deep.equal(testData);
        }
    });
});
