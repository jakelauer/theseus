// Ignore issues with self-signed certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

module.exports = {
	// Use ts-node rather than node, so we get TypeScript support
	require: [
		"ts-node/register"
	],
	// Search the whole tree
	recursive: true,
	// Match the following extensions
	extension: [
		"js",
		"ts",
		"tsx"
	],
	// Skip over shit
	ignore: [
		"**/node_modules/**/*",
	],
	// TBH I don't know why this is required, but removing it breaks things and it's not in the docs for Mocha.
	// Seems as though this determines the search pattern, but then why do I also have to specify extensions?
	spec: [
		"**/*.test.js",
		"**/*.test.ts",
		"**/*.test.tsx"
	]
}
