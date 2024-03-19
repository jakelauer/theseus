const arg = require("arg");
const fs = require("fs");
const prompts = require("prompts");

const getPackageJson = require("./get-package-json");

const validIncrementTypes = ["major", "minor", "patch"];

const args = arg({
    // Increments the major version number. Exclusive with --minor and --patch.
    "--type": String,
    // Commits the version change to git.
    "--commit": Boolean,
});

const getIncrement = (onContinue) => {
    let type = args["--type"];

    // Ensure that --type is one of "major", "minor", or "patch"
    if (!validIncrementTypes.includes(type)) {
        prompts(
            {
                type: "select",
                name: "incrementType",
                message: "What type of update is this?",
                choices: [
                    { title: "Major", value: "major" },
                    { title: "Minor", value: "minor" },
                    { title: "Patch", value: "patch" },
                    { title: "Quit", value: undefined },
                ],
            },
            {
                onSubmit: (_, answer) => {
                    console.log(`Answer: ${answer}`);

                    if (!answer) {
                        throw new Error("No increment type provided");
                    }

                    onContinue(answer);
                },
            },
        );
    } else {
        onContinue(type);
    }
};

(function () {
    getIncrement((increment) => {
        console.log(`Increment: ${increment}`);
        const verToSemver = (ver) => `${ver.major}.${ver.minor}.${ver.patch}`;

        const packageJson = getPackageJson();

        const versionParts = packageJson.version.split(".");
        const version = {
            major: Number(versionParts[0]),
            minor: Number(versionParts[1]),
            patch: Number(versionParts[2]),
        };

        switch (increment) {
            case "major":
                version.major++;
                version.minor = 0;
                version.patch = 0;
                break;
            case "minor":
                version.minor++;
                version.patch = 0;
                break;
            case "patch":
                version.patch++;
                break;
        }

        console.log(`Updating to version ${verToSemver(version)}`);

        const newVersion = `${version.major}.${version.minor}.${version.patch}`;
        packageJson.version = newVersion;

        fs.writeFileSync("./package.json", JSON.stringify(packageJson, null, 4));
        console.log(`Updated package.json to version ${newVersion}`);

        import("./commit").then((commit) => {
            console.log("Committing to git...");
        });
    });
})();
