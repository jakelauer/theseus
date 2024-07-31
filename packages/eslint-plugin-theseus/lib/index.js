/* eslint-env node */
module.exports = {
	parser: "@typescript-eslint/parser",
	parserOptions: {
		project: ["./lib/tsconfig.json"],
		ecmaVersion: 2018,
	},
	rules: {
		"break-on-chainable": require("./rules/break-on-chainable"),
		"no-floating-chainable": require("./rules/no-floating-chainable/no-floating-chainable"),
	},
	configs: {
		recommended: {
			plugins: [
				"theseus",  // This should match the name of your plugin
			],
			rules: {
				"theseus/break-on-chainable": "error",
				"theseus/no-floating-chainable": "error",
				"@typescript-eslint/no-floating-promises": ["error", {
					checkThenables: true, 
				}],
			},
		},
	},
};

