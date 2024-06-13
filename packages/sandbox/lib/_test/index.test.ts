import { expect } from "chai";
import * as cement from "../cement";
import * as reject from "../reject";
import * as sandbox from "../sandbox/sandbox";

describe("lib index", function() 
{
	it("should re-export everything from cement", function() 
	{
		expect(cement).to.be.an("object");
	});

	it("should re-export everything from reject", function() 
	{
		expect(reject).to.be.an("object");
	});

	it("should re-export everything from sandbox", function() 
	{
		expect(sandbox).to.be.an("object");
	});
});
