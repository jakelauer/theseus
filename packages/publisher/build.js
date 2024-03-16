const { execSync } = require("child_process");

module.exports = () => {
    execSync("pnpm build", { stdio: "inherit" });
};
