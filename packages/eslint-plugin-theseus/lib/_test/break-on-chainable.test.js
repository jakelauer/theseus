/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const RuleTester = require("eslint").RuleTester;
const rule = require("../rules/break-on-chainable");

// Use the appropriate parser if dealing with specific ECMAScript versions or TypeScript
const ruleTester = new RuleTester({
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: "module", 
	},
});

ruleTester.run("break-on-chainable", rule, {
	valid: [
		{
			code: "obj.via.thing()\n.and.anotherThing()",
		},
		{
			code: "obj.via.thing()\n.lastly.thing()",
		},
		{
			// If an ending method is used without chaining, don't force a line break
			code: "obj.via.thing().end()",
		},
		{
			// If no `.via` is present, we're not interested in the chain
			code: "obj.thing().and.anotherThing().lastly.thing();",
		},
		{
			// Properly handling async methods
			code: "async () => { await obj.via.thing().endAsync(); }",
		},
	],
	invalid: [
		{
			code: "obj.via.thing().and.anotherThing().lastly.thing();",
			errors: [
				{
					message: "Expected line break before `.and`.", 
				},
				{
					message: "Expected line break before `.lastly`.", 
				},
			],
			output: "obj.via.thing()\n.and.anotherThing()\n.lastly.thing();",
		},
		{
			code: "obj.via.thing().and.thing().end();",
			errors: [
				{
					message: "Expected line break before `.and`.", 
				},
				{
					message: "Expected line break before `.end`.", 
				},
			],
			output: "obj.via.thing()\n.and.thing()\n.end();",
		},
		{
			code: "obj.via.thing().and.thing().endAsync();",
			errors: [
				{
					message: "Expected line break before `.and`.", 
				},
				// {
				// 	message: "Detected floating promise for `.endAsync`. Await or handle the promise properly.", 
				// },
				{
					message: "Expected line break before `.endAsync`.", 
				},
			],
			output: "obj.via.thing()\n.and.thing()\n.endAsync();",
		},
		{
			code: "GameMeta.evolve.iterateTurnCount().and.updateLastPlayer(mark).and.updateLastPlayedCoords(coords);",
			errors: [
				{
					message: "Expected line break before `.and`.", 
				},
				{
					message: "Expected line break before `.and`.", 
				},
			],
			output: "GameMeta.evolve.iterateTurnCount()\n.and.updateLastPlayer(mark)\n.and.updateLastPlayedCoords(coords);",
		},
	],
});
