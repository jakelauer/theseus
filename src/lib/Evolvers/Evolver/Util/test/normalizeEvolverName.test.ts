import { expect } from "chai";
import { describe, it } from "mocha";

import { normalizeEvolverName } from "../normalizeEvolverName";

describe("normalizeEvolverName", () => {
    it('should remove "Evolver" from the start of the string, respecting case sensitivity', () => {
        const result = normalizeEvolverName("EvolverName");
        expect(result).to.equal("Name");
    });

    it('should remove "evolver" from the start of the string, respecting case sensitivity', () => {
        const result = normalizeEvolverName("evolverName");
        expect(result).to.equal("Name");
    });

    it('should remove "Evolver" from the end of the string, respecting case sensitivity', () => {
        const result = normalizeEvolverName("NameEvolver");
        expect(result).to.equal("Name");
    });

    it('should remove "evolver" from the end of the string, respecting case sensitivity', () => {
        const result = normalizeEvolverName("Nameevolver");
        expect(result).to.equal("Name");
    });

    it('should remove "Evolver" from both the start and the end of the string, respecting case sensitivity', () => {
        const result = normalizeEvolverName("EvolverNameEvolver");
        expect(result).to.equal("Name");
    });

    it('should remove "evolver" from both the start and the end of the string, respecting case sensitivity', () => {
        const result = normalizeEvolverName("evolverNameevolver");
        expect(result).to.equal("Name");
    });

    it('should not alter the string if "Evolver" or "evolver" is not present', () => {
        const result = normalizeEvolverName("Name");
        expect(result).to.equal("Name");
    });

    it('should handle strings with only "Evolver", respecting case sensitivity', () => {
        const result = normalizeEvolverName("Evolver");
        expect(result).to.equal("");
    });

    it('should handle strings with only "evolver", respecting case sensitivity', () => {
        const result = normalizeEvolverName("evolver");
        expect(result).to.equal("");
    });

    it("should correctly process an empty string", () => {
        const result = normalizeEvolverName("");
        expect(result).to.equal("");
    });
});
