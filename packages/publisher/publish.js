const { execSync } = require("child_process");
const build = require("./build");

build();

const getPackageJson = require("./get-package-json");

const packageJson = getPackageJson();

const gitPendingResults = execSync("git status --porcelain").toString();
const gitHasPendingTheseusChanges = gitPendingResults.includes("packages/theseus");
if (gitHasPendingTheseusChanges) {
    throw new Error(
        "Git has pending changes in this package. Commit or stash them before updating the version",
    );
}

const existingNpmVersion = execSync("npm view theseus-js version").toString().trim();

if (existingNpmVersion === packageJson.version) {
    console.log(`Version ${packageJson.version} already published to npm.`);
}
