import { expect } from "chai";
import sinonChai from "sinon-chai";
import sinon from "sinon";
import * as isSandboxProxy from "../lib/sandbox/is-sandbox-proxy";
import { sandbox } from "../lib/sandbox/sandbox";
import chai from "chai";
import { cement } from "../lib";

chai.use(sinonChai);

describe("Integration type tests", function() 
{ 
	// Define the spy variable
	let consoleWarnSpy;
  
	// Before each test, create a spy for console.warn
	beforeEach(function() 
	{
	  consoleWarnSpy = sinon.spy(console, "warn");
	});
  
	// After each test, restore the original console.warn
	afterEach(function() 
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
		const keys = Array.from({
			length: keyCount, 
		}, (_, i) => `${key}-${i}`);

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

		const isSbProxy = isSandboxProxy.isSandboxProxy(sb);

		expect(() => JSON.stringify(sandbox)).not.to.throw();
		expect(isSbProxy).to.be.true;

		expect(consoleWarnSpy).not.to.be.calledWith("Root object is a sandbox proxy, but it contains non-sandboxed objects as properties. This may cause unexpected behavior.");
	};

	const cementSandbox = (key: string, value: any) => 
	{
		const sb = sandbox(createMultiLevelObject(key, value));

		const cemented = cement(sb);

		const isSbProxy = isSandboxProxy.sandboxProxyStatus(cemented);

		expect(() => JSON.stringify(cemented)).not.to.throw();
		expect(isSbProxy).to.deep.equal({
			root: false,
			properties: false,
		});
	};

	const propValuesByType = {
		"string": "string",
		"number": 1,
		"number-decimal": 1.1,
		"boolean": true,
		"null": null,
		"undefined": undefined,
		"object": {},
		"array": [],
		"function": new Function(),
		"lambda-function": () => {},
		"date": new Date(),
		"regexp": new RegExp(""),
		"error": new Error(""),
		"map": new Map(),
		"set": new Set(),
		"promise": new Promise(() => {}),
		"weakmap": new WeakMap(),
		"weakset": new WeakSet(),
		"arraybuffer": new ArrayBuffer(1),
		"sharedarraybuffer": new SharedArrayBuffer(1),
		"dataview": new DataView(new ArrayBuffer(1)),
		"int8array": new Int8Array(1),
		"uint8array": new Uint8Array(1),
		"uint8clampedarray": new Uint8ClampedArray(1),
		"int16array": new Int16Array(1),
		"uint16array": new Uint16Array(1),
		"int32array": new Int32Array(1),
		"uint32array": new Uint32Array(1),
		"float32array": new Float32Array(1),
		"float64array": new Float64Array(1),
		"bigint64array": new BigInt64Array(1),
		"biguint64array": new BigUint64Array(1),
		"bigint": BigInt(1),
	} as const;
	
	const unserializableKeys = [
		"bigint64array",
		"biguint64array",
		"bigint",
	];

	for (const key in propValuesByType)
	{
		if (!unserializableKeys.includes(key))
		{
			describe("Integration testing for " + key, function() 
			{
				it(`should be able to create a sandbox proxy for ${key}`, function() 
				{
					const val = propValuesByType[key as keyof typeof propValuesByType];

					validateSandbox(key, val);
				});

				it(`should be able to cement a sandbox proxy for ${key}`, function()
				{
					const val = propValuesByType[key as keyof typeof propValuesByType];

					cementSandbox(key, val);
				});
			});
		}
	}
});
