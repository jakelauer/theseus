import {
	expect, describe, it, vi,
} from "vitest";
import { sandboxTransform } from "../sandbox-transform.js";

describe("deepSandboxTransform", function () 
{
    interface TestObject {
        [key: string]: any;
    }

    it("should apply transform to values that match the predicate", function () 
    {
    	const obj: TestObject = {
    		a: 1,
    		b: 2,
    		c: 3,
    	};
    	const transform = vi.fn((val: any) => val * 2);
    	const predicate = (val: any) => val > 1;

    	const result = sandboxTransform(obj, transform, predicate);

    	expect(result).to.deep.equal({
    		a: 1,
    		b: 4,
    		c: 6,
    	});
    	expect(transform).toHaveBeenCalledTimes(2);
    	expect(transform).toHaveBeenNthCalledWith(1, 2);
    	expect(transform).toHaveBeenNthCalledWith(2, 3);
    });

    it("should not apply transform to values that do not match the predicate", function () 
    {
    	const obj: TestObject = {
    		a: 1,
    		b: 2,
    		c: 3,
    	};
    	const transform = vi.fn((val: any) => val * 2);
    	const predicate = (val: any) => val > 3;

    	const result = sandboxTransform(obj, transform, predicate);

    	expect(result).to.deep.equal({
    		a: 1,
    		b: 2,
    		c: 3,
    	});
    	expect(transform).not.toHaveBeenCalled();
    });

    it("should apply transform to all values if no predicate is provided", function () 
    {
    	const obj: TestObject = {
    		a: 1,
    		b: 2,
    		c: 3,
    	};
    	const transform = vi.fn((val: any) => val * 2);

    	const result = sandboxTransform(obj, transform);

    	expect(result).to.deep.equal({
    		a: 2,
    		b: 4,
    		c: 6,
    	});
    	expect(transform).toHaveBeenCalledTimes(3);
    	expect(transform).toHaveBeenNthCalledWith(1, 1);
    	expect(transform).toHaveBeenNthCalledWith(2, 2);
    	expect(transform).toHaveBeenNthCalledWith(3, 3);
    });

    it("should not handle nested objects", function () 
    {
    	const obj: TestObject = {
    		a: {
    			d: 1,
    		},
    		b: 2,
    		c: 3,
    	};
    	const transform = vi.fn((val: any) => (typeof val === "number" ? val * 2 : val));
    	const predicate = (val: any) => typeof val === "number";

    	const result = sandboxTransform(obj, transform, predicate);

    	expect(result).to.deep.equal({
    		a: {
    			d: 1,
    		},
    		b: 4,
    		c: 6,
    	});
    	expect(transform).toHaveBeenCalledTimes(2);
    	expect(transform).toHaveBeenNthCalledWith(1, 2);
    	expect(transform).toHaveBeenNthCalledWith(2, 3);
    });

    it("should handle empty objects", function () 
    {
    	const obj: TestObject = {};
    	const transform = vi.fn((val: any) => val * 2);

    	const result = sandboxTransform(obj, transform);

    	expect(result).to.deep.equal({});
    	expect(transform).not.toHaveBeenCalled();
    });
});
