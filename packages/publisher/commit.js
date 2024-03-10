const { execSync } = require("child_process");
const prompts = require("prompts");
const getPackageJson = require("./get-package-json");
const version = getPackageJson().version;

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
				console.log(`Answer: ${answer}`);

				onContinue(answer);
			},
		},
	);
};

tryCommit((doCommit) => {
	console.log(`doCommit: ${doCommit}`);
	if (doCommit) {

		try {
			console.log(`Calling: git add package.json`);
			execSync(`git add package.json`, { stdio: 'inherit' });
			console.log(`Calling: git commit -m "Update version to ${version}" -- package.json`);
			execSync(`git commit -m "Update version to ${version}" -- package.json`, { stdio: 'inherit' });
			console.log("Committed package.json to git!");
		} catch (error) {
			console.error(`Error: ${error}`);
		}
	}
});
