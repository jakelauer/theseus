import { expect } from "chai";

import { normalizeRefineryName } from "../normalizeRefineryName";

describe("normalizeRefineryName", function () 
{
    it("should remove 'refinery' from the start of the string", function () 
    {
        const result = normalizeRefineryName("refineryExample");
        expect(result).to.equal("Example");
    });

    it("should remove 'Refinery' from the start of the string", function () 
    {
        const result = normalizeRefineryName("RefineryExample");
        expect(result).to.equal("Example");
    });

    it("should remove 'refinery' from the end of the string", function () 
    {
        const result = normalizeRefineryName("ExampleRefinery");
        expect(result).to.equal("Example");
    });

    it("should remove 'refinery' from both ends of the string", function () 
    {
        const result = normalizeRefineryName("refineryExampleRefinery");
        expect(result).to.equal("Example");
    });

    it("should not alter strings without 'refinery'", function () 
    {
        const result = normalizeRefineryName("Example");
        expect(result).to.equal("Example");
    });

    it("should handle empty strings correctly", function () 
    {
        const result = normalizeRefineryName("");
        expect(result).to.equal("");
    });
});
