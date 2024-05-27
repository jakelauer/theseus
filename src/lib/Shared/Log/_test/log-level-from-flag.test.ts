import { expect } from "chai";
import { determineLogLevel } from "../log-level-from-flag";
import { logLevels } from "../set-theseus-log-level";


describe("log-level-from-flag", function() 
{
	it("should return undefined if --theseus-log-level flag is not present", function() 
	{
		const argv = ["node", "script.js"];
		const result = determineLogLevel(argv);
		expect(result).to.be.undefined;
	});

	it('should return "silent" if --theseus-log-level flag is present without a value', function() 
	{
		const argv = ["node", "script.js", "--theseus-log-level"];
		const result = determineLogLevel(argv);
		expect(result).to.equal("silent");
	});

	it("should return the correct log level if --theseus-log-level flag is present with a valid value", function() 
	{
		const validLevels = Object.keys(logLevels) as Array<keyof typeof logLevels>;

		validLevels.forEach((level) => 
		{
			const argv = ["node", "script.js", "--theseus-log-level", level];
			const result = determineLogLevel(argv);
			expect(result).to.equal(level);
		});
	});

	it('should return "silent" if --theseus-log-level flag is present with an invalid value', function() 
	{
		const argv = ["node", "script.js", "--theseus-log-level", "invalid"];
		const result = determineLogLevel(argv);
		expect(result).to.equal("silent");
	});
});
