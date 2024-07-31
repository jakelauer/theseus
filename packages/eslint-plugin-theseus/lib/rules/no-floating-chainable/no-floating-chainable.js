/* eslint-env node */

"use strict";
// eslint-disable-next-line
const { ESLintUtils } = require("@typescript-eslint/utils");

const createRule = ESLintUtils.RuleCreator((name) => `https://example.com/rule/${name}`);

const typeFromNode = (node, context) => 
{
	const { program, esTreeNodeToTSNodeMap } = context.sourceCode.parserServices;

	const typeChecker = program.getTypeChecker();
	const typescriptNode = esTreeNodeToTSNodeMap.get(node);
	const type = typeChecker.getTypeAtLocation(typescriptNode);
	return type;
};

const hasAllKeys = (keys, propertyNames) => keys.every((key) => propertyNames.includes(key));

const getNestedTypeProperties = (typeChecker, type) => type.types.map((t) => typeChecker.getPropertiesOfType(t)).flat();

const getTypeProperties = (type, typeChecker) => 
{
	const typeForKeys = getChainableType(type, typeChecker);

	const properties = typeChecker.getPropertiesOfType(typeForKeys);
	
	return properties;
};

const matchesChainableKeyGroup = (requiredKeys, propertyNames) => 
{
	const hasAllKeysAsync = hasAllKeys(requiredKeys.async, propertyNames);
	const hasAllKeysNonAsync = hasAllKeys(requiredKeys.nonAsync, propertyNames);

	return hasAllKeysAsync || hasAllKeysNonAsync;
};

const getChainableType = (type, typeChecker) => 
{
	let typeForKeys = type;

	if (type.symbol && type.symbol.name === "Record") 
	{
		const typeArguments = typeChecker.getTypeArguments(type);
		const recordType = typeArguments[1];
		typeForKeys = recordType;
	}

	return typeForKeys;
};

const getChainablePropertyNames = (type, typeChecker) => 
{
	const isNestedType = type.isIntersection() || type.isUnion();
	const properties = isNestedType ? getNestedTypeProperties(typeChecker, type) : getTypeProperties(type, typeChecker);
	const propertyNames = properties.map((property) => property.name);
	return propertyNames;
};

const hasRequiredKeysInType = (type, requiredKeys, typeChecker) => 
{
	const chainablePropertyNames = getChainablePropertyNames(type, typeChecker);

	return matchesChainableKeyGroup(requiredKeys, chainablePropertyNames);
};

const rule = createRule({
	name: "no-floating-chainable",
	meta: {
		type: "problem",
		docs: {
			description: "Disallow floating chainable mutators",
			recommended: "error",
		},
		messages: {
			floatingChainableMutator: "Evolver mutator is not allowed to be floating. Use `.and()`, `.end()`, or `.lastly()` to complete the chain.",
		},
		schema: [],
	},
	defaultOptions: [],
	create(context) 
	{

		const requiredKeys = {
			nonAsync: ["and", "end", "lastly"],
			async: ["andAsync", "endAsync", "lastlyAsync"],
		};

		return {
			ExpressionStatement(node) 
			{
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const code = context.sourceCode.text; // for debugging - DO NOT REMOVE
				
				const type = typeFromNode(node.expression, context);
				const typeChecker = context.sourceCode.parserServices.program.getTypeChecker();

				if (type) 
				{
					const messageId = hasRequiredKeysInType(type, requiredKeys, typeChecker)
						? "floatingChainableMutator"
						: null;

					if (messageId) 
					{
						context.report({
							node,
							messageId,
						});
					}
				}
			},
		};
	},
});

module.exports = rule;
