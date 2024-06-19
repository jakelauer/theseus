import { defineConfig } from "tsup";
import * as glob from "glob";

const entries = glob.sync("src/**/*.ts", {
	ignore: ["src/**/*.test.ts"],
});

export default defineConfig({
	entry: entries,
	format: ["cjs"],
	dts: false,
	clean: true,
	splitting: false,
	sourcemap: true,
	outDir: "dist",
});
