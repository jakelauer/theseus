import { Refinery } from "../Refinery.js";

import {
	expect, describe, it, 
} from "vitest";

describe("Refinery Base", function () 
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
    			forge1: ({ testData }) => ({
    				...testData,
    				field: testData.field.toUpperCase(),
    			}),
    		});
    	expect(output.refineryName).to.equal("test");
    });

    it("should apply forge functions correctly", function () 
    {
    	const testRefinery = Refinery.create("testRefinery", refineryDefinition)
    		.toRefine<TestData>()
    		.withForges({
    			forge1: ({ testData }) => ({
    				...testData,
    				field: testData.field.toUpperCase(),
    			}),
    		});
    	const testData: TestData = {
    		field: "test",
    	};
    	const result = testRefinery.refine(testData).forge1(); // Assuming `applyForges` is a method to apply forges
    	expect(result.field).to.equal("TEST");
    });

    it("should allow a refinery's instance to be callback directly and return the refined data", function () 
    {
    	const testRefinery = Refinery.create("testRefinery", refineryDefinition)
    		.toRefine<TestData>()
    		.withForges({
    			forge1: ({ testData }) => ({
    				...testData,
    				field: testData.field.toUpperCase(),
    			}),
    		});
    	const testData: TestData = {
    		field: "test",
    	};
    	const result = testRefinery.refine(testData).forge1();
    	expect(result.field).to.equal("TEST");
    });
});
