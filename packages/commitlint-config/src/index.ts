import type {
	RuleConfigCondition,
	TargetCaseType, 
} from "@commitlint/types";
import { RuleConfigSeverity } from "@commitlint/types";

export default {
	preset: "angular",
	parserPreset: "conventional-changelog-conventionalcommits",
	rules: {
		"body-leading-blank": [RuleConfigSeverity.Warning, "always"] as const,
		"footer-leading-blank": [RuleConfigSeverity.Warning, "always"] as const,
		"header-max-length": [RuleConfigSeverity.Error, "always", 120] as const,
		"header-trim": [RuleConfigSeverity.Error, "always"] as const,
		"subject-case": [
			RuleConfigSeverity.Error,
			"never",
			["sentence-case", "start-case", "pascal-case", "upper-case"],
		] as [RuleConfigSeverity, RuleConfigCondition, TargetCaseType[]],
		"subject-empty": [RuleConfigSeverity.Error, "never"] as const,
		"subject-full-stop": [RuleConfigSeverity.Error, "never", "."] as const,
		"type-case": [RuleConfigSeverity.Error, "always", "lower-case"] as const,
		"type-empty": [RuleConfigSeverity.Error, "never"] as const,
		"type-enum": [
			RuleConfigSeverity.Error,
			"always",
			[
				"build",
				"ci",
				"chore",
				"docs",
				"feat",
				"fix",
				"perf",
				"refactor",
				"revert",
				"style",
				"test",
			],
		] as [RuleConfigSeverity, RuleConfigCondition, string[]],
	},
	releaseRules: [
		// major
		{
			breaking: true,
			release: "major", 
		},
		{
			revert: true,
			release: "patch", 
		},
		// minor
		{
			type: "feat",
			release: "minor", 
		},
		{
			type: "build",
			release: "minor", 
		},
		// patch
		{
			type: "fix",
			release: "patch", 
		},
		{
			type: "perf",
			release: "patch", 
		},
		{
			type: "docs",
			release: "patch", 
		},
		{
			type: "refactor",
			release: "patch", 
		},
		{
			type: "style",
			release: "patch", 
		},
		// none
		{
			type: "ci",
			release: false, 
		},
		{
			scope: "no-release",
			release: false, 
		},
	],
	prompt: {
		questions: {
			type: {
				description: "Select the type of change that you're committing",
				enum: {
					feat: {
						description: "A new feature",
						title: "Features",
						emoji: "✨",
					},
					fix: {
						description: "A bug fix",
						title: "Bug Fixes",
						emoji: "🐛",
					},
					docs: {
						description: "Documentation only changes",
						title: "Documentation",
						emoji: "📚",
					},
					style: {
						description:
							"Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)",
						title: "Styles",
						emoji: "💎",
					},
					refactor: {
						description:
							"A code change that neither fixes a bug nor adds a feature",
						title: "Code Refactoring",
						emoji: "📦",
					},
					perf: {
						description: "A code change that improves performance",
						title: "Performance Improvements",
						emoji: "🚀",
					},
					test: {
						description: "Adding missing tests or correcting existing tests",
						title: "Tests",
						emoji: "🚨",
					},
					build: {
						description:
							"Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)",
						title: "Builds",
						emoji: "🛠",
					},
					ci: {
						description:
							"Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)",
						title: "Continuous Integrations",
						emoji: "⚙️",
					},
					revert: {
						description: "Reverts a previous commit",
						title: "Reverts",
						emoji: "🗑",
					},
				},
			},
			scope: {
				description:
					"What is the scope of this change (e.g. component/filename/no-release)",
			},
			subject: {
				description:
					"Write a short, imperative tense description of the change",
			},
			body: {
				description: "Provide a longer description of the change",
			},
			isBreaking: {
				description: "Are there any breaking changes?",
			},
			breakingBody: {
				description:
					"A BREAKING CHANGE commit requires a body. Please enter a longer description of the commit itself",
			},
			breaking: {
				description: "Describe the breaking changes",
			},
			isIssueAffected: {
				description: "Does this change affect any open issues?",
			},
			issuesBody: {
				description:
					"If issues are closed, the commit requires a body. Please enter a longer description of the commit itself",
			},
			issues: {
				description: 'Add issue references (e.g. "fix #123", "re #123".)',
			},
		},
	},
};
