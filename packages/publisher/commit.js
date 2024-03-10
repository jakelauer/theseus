const { execSync } = require("child_process");
const prompts = require("prompts");

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

tryCommit((doCommit) => {
	if (doCommit) {
		execSync(`git add package.json`, { stdio: 'inherit' });
		execSync(`git commit -m "Update version to ${newVersion}" -- package.json`, { stdio: 'inherit' });
		console.log("Committed package.json to git!");
	}
});
