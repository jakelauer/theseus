import sinonChai from "sinon-chai";
import {
	expect, afterEach, beforeEach, describe, it, 
} from "vitest";
import sinon from "sinon";
import { sandbox } from "../actions/sandbox/sandbox.js";
import {
	cement, frost, isFrost, isSandbox, 
} from "../index.js";
import isElligibleForProxy from "../proxy-handler/validity/is-elligible-for-proxy.js";

chai.use(sinonChai);

describe("Integration type tests", function () 
{
	// Define the spy variable
	let consoleWarnSpy;

	// Before each test, create a spy for console.warn
	beforeEach(function () 
	{
		consoleWarnSpy = sinon.spy(console, "warn");
	});

	// After each test, restore the original console.warn
	afterEach(function () 
	{
		consoleWarnSpy.restore();
	});

	const createMultiLevelObject = (key: string, value: any) => 
	{
		// function which recursively adds a random number of depth levels to an object
		const addDepth = (obj: any, innerVal: any, depth: number) => 
		{
			if (depth === 0) 
			{
				return obj;
			}

			obj[`${key}-level-${depth}`] = addDepth({}, innerVal, depth - 1);

			return obj;
		};

		const keyCount = Math.floor(Math.random() * 10) + 1;
		const keys = Array.from(
			{
				length: keyCount,
			},
			(_, i) => `${key}-${i}`,
		);

		const obj = keys.reduce((acc, cur) => 
		{
			const randomDepth = Math.floor(Math.random() * 5) + 1;
			const newObj = addDepth({}, value, randomDepth);
			acc[cur] = newObj;
			return acc;
		}, {});

		return obj;
	};

	const validateSandbox = (key: string, value: any) => 
	{
		const sb = sandbox(createMultiLevelObject(key, value));

		const isSbProxy = isSandbox(sb);

		expect(() => JSON.stringify(sandbox)).not.to.throw();
		expect(isSbProxy).to.be.true;

		expect(consoleWarnSpy).not.to.be.calledWith(
			"Root object is a sandbox proxy, but it contains non-sandboxed objects as properties. This may cause unexpected behavior.",
		);
	};

	const cementSandbox = (key: string, value: any) => 
	{
		const sb = sandbox(createMultiLevelObject(key, value), {
			mode: "copy",
		});

		const cemented = cement(sb);

		const isSbProxy = isSandbox(cemented, "every");

		expect(() => JSON.stringify(cemented)).not.to.throw();
		expect(isSbProxy).to.equal(false);
	};

	const multiLayerSandbox = (key: string, value: any) => 
	{
		const originial = createMultiLevelObject(key, value);
		const sb0 = sandbox(originial);
		const sb1 = sandbox(sb0);
		const sb2 = sandbox(sb1);
		const sb3 = sandbox(sb2);

		const isSbProxy = isSandbox(sb3);

		expect(() => JSON.stringify(sandbox)).not.to.throw();
		expect(isSbProxy).to.be.true;

		expect(consoleWarnSpy).not.to.be.calledWith(
			"Root object is a sandbox proxy, but it contains non-sandboxed objects as properties. This may cause unexpected behavior.",
		);
	};

	const multiLayerCement = (key: string, value: any) => 
	{
		const originial = createMultiLevelObject(key, value);
		const sb0 = sandbox(originial);
		const sb1 = sandbox(sb0);
		const sb2 = sandbox(sb1);
		const sb3 = sandbox(sb2);

		const cemented = cement(sb3);

		const isSbProxy = isSandbox(cemented, "every");

		expect(() => JSON.stringify(cemented)).not.to.throw();
		expect(isSbProxy).to.equal(false);
	};

	const propValuesByType = {
		string: "string",
		number: 1,
		"number-decimal": 1.1,
		boolean: true,
		null: null,
		undefined: undefined,
		object: {},
		array: [],
		"array-with-objects": [{}, null, {}],
		function: new Function(),
		"lambda-function": () => {},
		date: new Date(),
		regexp: new RegExp(""),
		error: new Error(""),
		map: new Map(),
		set: new Set(),
		promise: new Promise(() => {}),
		weakmap: new WeakMap(),
		weakset: new WeakSet(),
		arraybuffer: new ArrayBuffer(1),
		sharedarraybuffer: new SharedArrayBuffer(1),
		dataview: new DataView(new ArrayBuffer(1)),
		int8array: new Int8Array(1),
		uint8array: new Uint8Array(1),
		uint8clampedarray: new Uint8ClampedArray(1),
		int16array: new Int16Array(1),
		uint16array: new Uint16Array(1),
		int32array: new Int32Array(1),
		uint32array: new Uint32Array(1),
		float32array: new Float32Array(1),
		float64array: new Float64Array(1),
		bigint64array: new BigInt64Array(1),
		biguint64array: new BigUint64Array(1),
		bigint: BigInt(1),
	} as const;

	const unserializableKeys = ["bigint64array", "biguint64array", "bigint"];

	for (const key in propValuesByType) 
	{
		if (!unserializableKeys.includes(key)) 
		{
			describe("Integration testing for " + key, function () 
			{
				it(`should be able to create a sandbox proxy for ${key}`, function () 
				{
					const val = propValuesByType[key as keyof typeof propValuesByType];

					validateSandbox(key, val);
				});

				it(`should be able to cement a sandbox proxy for ${key}`, function () 
				{
					const val = propValuesByType[key as keyof typeof propValuesByType];

					cementSandbox(key, val);
				});

				it(`should be able to create a multi-nested sandbox proxy for ${key}`, function () 
				{
					const val = propValuesByType[key as keyof typeof propValuesByType];

					multiLayerSandbox(key, val);
				});

				it(`should be able to cement a multi-nested sandbox proxy for ${key}`, function () 
				{
					const val = propValuesByType[key as keyof typeof propValuesByType];

					multiLayerCement(key, val);
				});

				if (key === "array-with-objects" || key === "array") 
				{
					it(`should be able to create a sandbox proxy of inner values for ${key}`, function () 
					{
						const val = propValuesByType[key as keyof typeof propValuesByType];

						expect(val?.[Symbol.toStringTag]).to.be.undefined;
						expect(isElligibleForProxy(val)).to.be.true;

						// @ts-expect-error - known possible undefined value
						const sb = sandbox(val);
						// @ts-expect-error - known possible undefined value
						const f = frost(val);

						expect(isSandbox(sb)).to.be.true;
						expect(isFrost(f)).to.be.true;
					});
				}
				else if (key === "object") 
				{
					it(`should be able to create a sandbox proxy of type ${key} directly`, function () 
					{
						const val = propValuesByType[key as keyof typeof propValuesByType];

						expect(val?.[Symbol.toStringTag]).to.be.undefined;
						expect(isElligibleForProxy(val)).to.be.true;

						// @ts-expect-error - known possible undefined value
						const sb = sandbox(val);
						// @ts-expect-error - known possible undefined value
						const f = frost(val);

						expect(isSandbox(sb)).to.be.true;
						expect(isFrost(f)).to.be.true;
					});
				}
				else 
				{
					it(`should not be able to create a sandbox proxy of type ${key} directly`, function () 
					{
						const val = propValuesByType[key as keyof typeof propValuesByType];

						expect(isElligibleForProxy(val)).to.equal(
							false,
							`Expected ${key} not to be elligible for proxy`,
						);

						// @ts-expect-error - known possible undefined value
						const sb = sandbox(val);
						// @ts-expect-error - known possible undefined value
						const f = frost(val);

						expect(isSandbox(sb)).to.equal(false, `Expected ${key} to not be a sandbox`);
						expect(isFrost(f)).to.equal(false, `Expected ${key} to not be frosty`);
					});
				}
			});
		}
	}
});
