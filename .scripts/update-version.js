const arg = require("arg");
const { execSync } = require("child_process");
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

const tryCommit = (onContinue) => {
    prompts(
        {
            type: "select",
            name: "commit",
            message: "Commit package.json to Git?",
            choices: [
                { title: "Yes, commit it!", value: true },
                { title: "No, don't commit it.", value: false },
            ],
        },
        {
            onSubmit: (_, answer) => {
                const doCommit = answer.commit;

                onContinue(doCommit);
            },
        },
    );
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

        tryCommit((doCommit) => {
            if (doCommit) {
                execSync(`git add package.json`);
                execSync(`git commit -m "Update version to ${newVersion}" -- package.json`);
                console.log("Committed package.json to git!");
            }
        });
    });
})();
