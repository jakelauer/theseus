const { readFileSync } = require("fs");

function getPackageJson() {
    const packageJson = JSON.parse(readFileSync("./package.json", "utf8"));
    return packageJson;
}

module.exports = getPackageJson;
