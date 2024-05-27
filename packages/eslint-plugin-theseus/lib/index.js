/* eslint-disable no-undef */
module.exports = {
	rules: {
		"break-on-chainable": require("./rules/break-on-chainable"),
	},
	configs: {
		recommended: {
			plugins: [
				"theseus",  // This should match the name of your plugin
			],
			rules: {
				"theseus/break-on-chainable": "error",
			},
		},
	},
};
