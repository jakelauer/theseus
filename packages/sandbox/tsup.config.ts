import { defineConfig } from "tsup";
import * as glob from "glob";

const entries = glob.sync("lib/**/*.ts", {
	ignore: ["**/*.test.ts", "**/*.spec.ts"],
});

export default defineConfig({
	entry: entries,
	format: ["esm", "cjs"],
	dts: true,
	clean: true,
	splitting: false,
	sourcemap: true,
	outDir: "dist",
});
