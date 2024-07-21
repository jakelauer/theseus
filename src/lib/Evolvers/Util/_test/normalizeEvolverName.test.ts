import { normalizeEvolverName } from "../normalizeEvolverName.js";

import { expect } from "vitest";

"normalizeEvolverName",
() => 
{
	'should remove "Evolver" from the start of the string, respecting case sensitivity',
	() => 
	{
		const result = normalizeEvolverName("EvolverName" as any);
		expect(result).to.equal("Name");
	};

	'should remove "evolver" from the start of the string, respecting case sensitivity',
	() => 
	{
		const result = normalizeEvolverName("evolverName" as any);
		expect(result).to.equal("Name");
	};

	'should remove "Evolver" from the end of the string, respecting case sensitivity',
	() => 
	{
		const result = normalizeEvolverName("NameEvolver");
		expect(result).to.equal("Name");
	};

	'should remove "evolver" from the end of the string, respecting case sensitivity',
	() => 
	{
		const result = normalizeEvolverName("Nameevolver" as any);
		expect(result).to.equal("Name");
	};

	'should remove "Evolver" from both the start and the end of the string, respecting case sensitivity',
	() => 
	{
		const result = normalizeEvolverName("EvolverNameEvolver" as any);
		expect(result).to.equal("Name");
	};

	'should remove "evolver" from both the start and the end of the string, respecting case sensitivity',
	() => 
	{
		const result = normalizeEvolverName("evolverNameevolver" as any);
		expect(result).to.equal("Name");
	};

	'should not alter the string if "Evolver" or "evolver" is not present',
	() => 
	{
		const result = normalizeEvolverName("Name" as any);
		expect(result).to.equal("Name");
	};

	'should handle strings with only "Evolver", respecting case sensitivity',
	() => 
	{
		const result = normalizeEvolverName("Evolver");
		expect(result).to.equal("");
	};

	'should handle strings with only "evolver", respecting case sensitivity',
	() => 
	{
		const result = normalizeEvolverName("evolver" as any);
		expect(result).to.equal("");
	};

	"should correctly process an empty string",
	() => 
	{
		const result = normalizeEvolverName("" as any);
		expect(result).to.equal("");
	};
};
