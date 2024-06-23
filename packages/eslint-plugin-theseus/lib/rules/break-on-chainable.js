/* eslint-disable no-undef */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
	meta: {
		type: "layout",
		docs: {
			description: "Require a newline before specific method or property access in a chain, but only if `.via` is in the chain",
			recommended: false,
			url: "https://eslint.org/docs/latest/rules/newline-per-chained-call",
		},
		fixable: "whitespace",
		schema: [],  // No options in this simplified version
		messages: {
			expected: "Expected line break before `.{{property}}`.",
		},
	},

	create(context) 
	{
		const sourceCode = context.getSourceCode();
		const chainingMethods = new Set(["and", "lastly"]);
		const endingMethods = new Set(["end", "endAsync"]);
		const targetedRoots = new Set(["via", "evolve", "mutate"]);

		function isLikelyTheseus(node)
		{
			const tokens = sourceCode.getTokensBefore(node, { count: 20, filter: ({ type,value }) => 
			{
				return type === "Identifier" && targetedRoots.has(value);
			} });

			return tokens.length > 0;
		}

		function isEndingMethodPrecededByChaining(node)
		{
			const tokens = sourceCode.getTokensBefore(node, { count: 20, filter: ({ type,value }) => 
			{
				return type === "Identifier" && chainingMethods.has(value);
			} });

			return tokens.length > 0;
		}

		return {
			"Identifier"(node) 
			{
				if (!node.parent.type === "MemberExpression")
				{
					return;
				}

				const isEndingMethod = endingMethods.has(node.name);
				const matchingNodeName = isEndingMethod || chainingMethods.has(node.name);

				if (isEndingMethod && !isEndingMethodPrecededByChaining(node))
				{
					return;
				}

				if (matchingNodeName && isLikelyTheseus(node)) 
				{
					// Only consider the direct .property access case, ensuring it's part of a member expression chain
					const tokenBeforeNode = sourceCode.getTokenBefore(node, { includeComments: false });
					if (tokenBeforeNode && tokenBeforeNode.type === "Punctuator" && tokenBeforeNode.value === ".") 
					{
						const dotBeforeNode = tokenBeforeNode;
						const tokenBeforeDot = sourceCode.getTokenBefore(dotBeforeNode, { includeComments: false });

						// Ensure `.via` is in the chain
						if (tokenBeforeDot && tokenBeforeDot.loc.end.line === node.loc.start.line) 
						{
							// Report if the dot connecting this property to the previous is on the same line
							context.report({
								node: node,
								messageId: "expected",
								data: {
									property: node.name,
								},
								fix(fixer) 
								{
									return fixer.insertTextBefore(tokenBeforeNode, "\n");
								},
							});
						}
					}
				}
			},
		};
	},
};
