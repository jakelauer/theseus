import { expect } from "chai";

import { MutatorSetBuilder } from "../MutatorSetBuilder";

describe("MutatorSetBuilder", function () 
{
    type TestData = { testProp: number };
    const paramNoun = "testProp";

    let initialData: TestData = {
    	testProp: 42, 
    };
    const makeBuilder = () =>
    	MutatorSetBuilder.create(initialData, paramNoun, {
    		increase: ({ testProp }, amount: number) => 
    		{
    			testProp.testProp += amount;
    			return testProp;
    		},
    	});
    let builder = makeBuilder();

    beforeEach(function () 
    {
    	initialData = {
    		testProp: 42, 
    	};
    	builder = makeBuilder();
    });

    it("should correctly initialize with given data, argument name, and mutators", function () 
    {
    	expect(builder)
    		.to.have.property("data")
    		.that.deep.includes({
    			[paramNoun]: initialData, 
    		});
    });

    it("inputToObject transforms input data into structured format", function () 
    {
    	const structuredData = (builder as any)["inputToObject"](initialData);
    	expect(structuredData).to.deep.equal({
    		[paramNoun]: initialData, 
    	});
    });

    it("create method returns a new instance of MutatorSetBuilder", function () 
    {
    	expect(builder).to.be.instanceOf(MutatorSetBuilder);
    	expect(builder)
    		.to.have.property("data")
    		.that.deep.includes({
    			[paramNoun]: initialData, 
    		});
    });

    it("create method returns a new instance with mutators applied", function () 
    {
    	console.log(builder);
    	// Assert the builder is correctly initialized
    	expect(builder).to.be.an.instanceof(MutatorSetBuilder);
    	expect(builder.increase(0)).to.deep.include(initialData);

    	// Dynamically check if the 'increase' mutator is applied and works as expected
    	// This will invoke the 'increase' function directly on the builder, demonstrating 
    	// its presence and functionality
    	const result = builder.increase(10);
    	expect(result).to.deep.equal({
    		testProp: 52, 
    	});
    });
});
