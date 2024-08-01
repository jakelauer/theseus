import { configDefaults, defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

const maxWorkersArg = process.argv.find((arg) => arg.includes("--maxWorkers"))?.split("=")[1];
const maxWorkersInt = maxWorkersArg ? parseInt(maxWorkersArg) : undefined;

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		poolOptions: maxWorkersInt ? {
			threads: {
				maxThreads: maxWorkersInt,
				minThreads: maxWorkersInt,
			},
		} : undefined,
		include: [...configDefaults.include, "**/test/*.ts"],
		passWithNoTests: true,
		testTimeout: 10_000,
		restoreMocks: true,
		deps: {
			inline: ["testdouble-vitest"],
		},
	},
});
