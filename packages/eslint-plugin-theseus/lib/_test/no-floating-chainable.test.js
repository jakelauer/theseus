/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
import { RuleTester } from "@typescript-eslint/rule-tester";
const rule = require("../rules/no-floating-chainable/no-floating-chainable");
const path = require("path");
import * as vitest from "vitest";

RuleTester.afterAll = vitest.afterAll;

// If you are not using vitest with globals: true (https://vitest.dev/config/#globals):
RuleTester.it = vitest.it;
RuleTester.itOnly = vitest.it.only;
RuleTester.describe = vitest.describe;

const ruleTester = new RuleTester({
	parserOptions: {
		project: "./tsconfig.json",
		ecmaVersion: "latest",
		tsconfigRootDir: path.join(__dirname, "fixture"),
	},
});

ruleTester.run("no-floating-chainable", rule, {
	valid: [
		{
			code: `
		const obj = {
			key: 'value'
		};
		console.log(obj);
		`,
		},
		{
			code: `
		const obj = {
			key: 'value'
		};
		function doSomething() {
			return obj;
		}
		`,
		},
		{
			code: `
		const someRecord = {
			and: () => {}
		};
		someRecord;
		`,
		},
		{
			code: `
		const someRecord = {
			end: () => {}
		};
		someRecord;
		`,
		},
		{
			code: `
		const someRecord = {
			lastly: () => {}
		};
		someRecord;
		`,
		},
		{
			code: `
		const someRecord = {
			andAsync: () => {}
		};
		someRecord;
		`,
		},
		{
			code: `
		const someRecord = {
			endAsync: () => {}
		};
		someRecord;
		`,
		},
		{
			code: `
		const someRecord = {
			lastlyAsync: () => {},
		};
		someRecord;
		`,
		},
		{
			code: `
		const someRecord = {
			and: () => {},
			lastlyAsync: () => {},
			endAsync: () => {},
		};
		someRecord;
		`,
		},
		{
			code: `
			class X 
			{
				protected z: string;
				constructor(x?: string) 
				{
					this.z = x;
				}
			}
			`,
		},
	],
	invalid: [
		{
			code: `
		const someRecord = {
			and: {},
			end: {},
			lastly: {}
		};

		someRecord;
		`,
			errors: [{
				messageId: "floatingChainableMutator", 
			}],
		},
		{
			code: `
		const someRecord = {
			and: () => {},
			end: () => {},
			lastly: () => {}
		};
		someRecord;
		`,
			errors: [{
				messageId: "floatingChainableMutator", 
			}],
		},
		{
			code: `
		const someRecord = {
			andAsync: () => {},
			endAsync: () => {},
			lastlyAsync: () => {}
		};
		someRecord;
		`,
			errors: [{
				messageId: "floatingChainableMutator", 
			}],
		},
		{
			code: `
		const someRecord = {
			andAsync: () => {},
			endAsync: () => {},
			lastlyAsync: () => {},
			other: () => {}
		};
		someRecord;
		`,
			errors: [{
				messageId: "floatingChainableMutator", 
			}],
		},
		{
			code: `
		const someRecord = {
			andAsync: () => {},
			endAsync: () => {},
			lastlyAsync: () => {},
			and: () => {},
			end: () => {},
			lastly: () => {}
		};
		someRecord;
		`,
			errors: [{
				messageId: "floatingChainableMutator", 
			}],
		},
		{
			code: `
		const x = {
			andAsync: {
				then: <TResult1 = any, TResult2 = never>(
					onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null | undefined,
					onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined
				) => PromiseLike<TResult1 | TResult2>,
			} & ChainableMutators<GameState, "gameState", {
				setWinner: ({ gameState }: ParamNameData<GameState, "gameState">, reason: "stalemate" | "winner") => GameState,
				nextTurn: ({ gameState }: ParamNameData<GameState, "gameState">) => Promise<GameState>,
			}, "notFinal", "async">,
			endAsync: () => Promise<GameState>,
			lastlyAsync: ChainableMutators<GameState, "gameState", {
				setWinner: ({ gameState }: ParamNameData<GameState, "gameState">, reason: "stalemate" | "winner") => GameState,
				nextTurn: ({ gameState }: ParamNameData<GameState, "gameState">) => Promise<GameState>,
			}, "final", "async">,
		};

		const someRecord: typeof x = {
			andAsync: {} as any,
			endAsync: {} as any,
			lastlyAsync: {} as any,
		};

		someRecord;
		`,
			errors: [{
				messageId: "floatingChainableMutator", 
			}],
		},
		{
			code: `
const someRecord:
	Record<"andAsync", any> &
	Record<"endAsync", any> &
	Record<"lastlyAsync", any> = {
		andAsync: {} as any,
		endAsync: {} as any,
		lastlyAsync: {} as any,
	};

someRecord;
`,
			errors: [{
				messageId: "floatingChainableMutator", 
			}],
		},
	],
});
