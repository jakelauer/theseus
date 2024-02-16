// Ignore issues with self-signed certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

module.exports = {
    // Search the whole tree
    recursive: true,
    // Match the following extensions
    extension: ["ts", "tsx"],
    // Skip over shit
    ignore: ["**/node_modules/**/*", "**/dist/**/*"],
    // TBH I don't know why this is required, but removing it breaks things and it's not in the docs for Mocha.
    // Seems as though this determines the search pattern, but then why do I also have to specify extensions?
    spec: ["**/*.test.js", "**/*.test.ts"],
    "node-option": ["loader=tsx/esm"],
};
