import { expect } from "chai";
import sinon from "sinon";
import { sandboxTransform } from "../sandbox-transform";

describe("deepSandboxTransform", function() 
{
    interface TestObject {
        [key: string]: any;
    }

    it("should apply transform to values that match the predicate", function() 
    {
    	const obj: TestObject = {
    		a: 1,
    		b: 2,
    		c: 3, 
    	};
    	const transform = sinon.spy((val: any) => val * 2);
    	const predicate = (val: any) => val > 1;

    	const result = sandboxTransform(obj, transform, predicate);

    	expect(result).to.deep.equal({
    		a: 1,
    		b: 4,
    		c: 6, 
    	});
    	expect(transform.calledTwice).to.be.true;
    	expect(transform.firstCall.calledWith(2)).to.be.true;
    	expect(transform.secondCall.calledWith(3)).to.be.true;
    });

    it("should not apply transform to values that do not match the predicate", function() 
    {
    	const obj: TestObject = {
    		a: 1,
    		b: 2,
    		c: 3, 
    	};
    	const transform = sinon.spy((val: any) => val * 2);
    	const predicate = (val: any) => val > 3;

    	const result = sandboxTransform(obj, transform, predicate);

    	expect(result).to.deep.equal({
    		a: 1,
    		b: 2,
    		c: 3, 
    	});
    	expect(transform.notCalled).to.be.true;
    });

    it("should apply transform to all values if no predicate is provided", function() 
    {
    	const obj: TestObject = {
    		a: 1,
    		b: 2,
    		c: 3, 
    	};
    	const transform = sinon.spy((val: any) => val * 2);

    	const result = sandboxTransform(obj, transform);

    	expect(result).to.deep.equal({
    		a: 2,
    		b: 4,
    		c: 6, 
    	});
    	expect(transform.calledThrice).to.be.true;
    	expect(transform.firstCall.calledWith(1)).to.be.true;
    	expect(transform.secondCall.calledWith(2)).to.be.true;
    	expect(transform.thirdCall.calledWith(3)).to.be.true;
    });

    it("should not handle nested objects", function() 
    {
    	const obj: TestObject = {
    		a: {
    			d: 1, 
    		},
    		b: 2,
    		c: 3, 
    	};
    	const transform = sinon.spy((val: any) => (typeof val === "number" ? val * 2 : val));
    	const predicate = (val: any) => typeof val === "number";

    	const result = sandboxTransform(obj, transform, predicate);

    	expect(result).to.deep.equal({
    		a: {
    			d: 1, 
    		},
    		b: 4,
    		c: 6, 
    	});
    	expect(transform.calledTwice).to.be.true;
    	expect(transform.firstCall.calledWith(2)).to.be.true;
    	expect(transform.secondCall.calledWith(3)).to.be.true;
    });

    it("should handle empty objects", function() 
    {
    	const obj: TestObject = {};
    	const transform = sinon.spy((val: any) => val * 2);

    	const result = sandboxTransform(obj, transform);

    	expect(result).to.deep.equal({});
    	expect(transform.notCalled).to.be.true;
    });
});
