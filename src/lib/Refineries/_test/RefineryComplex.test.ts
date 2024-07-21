import { expect } from "chai";

import { Refinery } from "@Refineries/Refinery";

import { RefineryComplex } from "../RefineryComplex.js";

describe("RefineryComplex", function () 
{
    interface TestData {
        field: string;
        count: number;
    }

    // Utility function to create a mock refinery that converts field to uppercase
    function createMockUpperCaseRefinery() 
    {
    	const mockUpperCaseRefinery = Refinery.create("mockUpperCaseRefinery", {
    		noun: "testData",
    	})
    		.toRefine<TestData>()
    		.withForges({
    			makeUppercase: ({ testData }) => ({
    				...testData,
    				field: testData.field.toUpperCase(),
    			}),
    		});

    	return mockUpperCaseRefinery;
    }

    // Utility function to create a mock refinery that increments count
    function createMockIncrementCountRefinery() 
    {
    	const mockIncrementCountRefinery = Refinery.create("mockIncrementCountRefinery", {
    		noun: "testData",
    	})
    		.toRefine<TestData>()
    		.withForges({
    			incrementCount: ({ testData }) => ({
    				...testData,
    				count: testData.count + 1,
    			}),
    		});

    	return mockIncrementCountRefinery;
    }

    it("should aggregate multiple refineries and process data correctly", function () 
    {
    	const refineryComplex = RefineryComplex.create<TestData>().withRefineries(
    		createMockUpperCaseRefinery(),
    		createMockIncrementCountRefinery(),
    	);

    	const testData: TestData = {
    		field: "test",
    		count: 1,
    	};
    	const { mockIncrementCount, mockUpperCase } = refineryComplex.refine(testData);
    	const resultAfterUppercase = mockUpperCase.makeUppercase();
    	const resultAfterIncrement = mockIncrementCount.incrementCount();

    	expect(resultAfterUppercase.field).to.equal("TEST");
    	expect(resultAfterIncrement.count).to.equal(2);
    });

    it("should maintain immutability of data across refineries", function () 
    {
    	const refineryComplex = RefineryComplex.create<TestData>().withRefineries(createMockUpperCaseRefinery());

    	const testData: TestData = {
    		field: "test",
    		count: 1,
    	};
    	const { mockUpperCase } = refineryComplex.refine(testData);
    	const resultBefore = {
    		...testData,
    	};
    	mockUpperCase.makeUppercase();

    	// Ensuring the original testData is not modified by the refinery process
    	expect(testData).to.deep.equal(resultBefore);
    });

    it("should handle empty data correctly", function () 
    {
    	const refineryComplex = RefineryComplex.create<TestData>().withRefineries(createMockUpperCaseRefinery());

    	const testData: TestData = {
    		field: "",
    		count: 0,
    	};
    	const { mockUpperCase } = refineryComplex.refine(testData);
    	const result = mockUpperCase.makeUppercase();

    	expect(result.field).to.equal("");
    });

    it("should apply refineries in sequence correctly", function () 
    {
    	const refineryComplex = RefineryComplex.create<TestData>().withRefineries(
    		createMockUpperCaseRefinery(),
    		createMockIncrementCountRefinery(),
    	);

    	const testData: TestData = {
    		field: "sequence",
    		count: 0,
    	};
    	const { mockIncrementCount, mockUpperCase } = refineryComplex.refine(testData);
    	const resultAfterUppercase = mockUpperCase.makeUppercase();
    	const resultAfterIncrement = mockIncrementCount.incrementCount();

    	// Verify that each refinery's transformation is applied sequentially
    	expect(resultAfterUppercase.field).to.equal("SEQUENCE");
    	expect(resultAfterIncrement.count).to.equal(1);
    });

    it("should preserve data immutability when applying multiple refineries", function () 
    {
    	const refineryComplex = RefineryComplex.create<TestData>().withRefineries(
    		createMockUpperCaseRefinery(),
    		createMockIncrementCountRefinery(),
    	);

    	const testData: TestData = {
    		field: "immutable",
    		count: 1,
    	};
    	const originalTestData = {
    		...testData,
    	};
    	const funcs = refineryComplex.refine(testData);
    	const { mockIncrementCount, mockUpperCase } = funcs;
    	mockUpperCase.makeUppercase();
    	mockIncrementCount.incrementCount();

    	// Verify original data remains unchanged
    	expect(testData).to.deep.equal(originalTestData);
    });
});
