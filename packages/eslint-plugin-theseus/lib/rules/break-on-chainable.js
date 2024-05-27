/* eslint-disable no-undef */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
	meta: {
		type: "layout",
		docs: {
			description: "Require a newline before specific method or property access in a chain",
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
		const targetedMethods = ["and", "lastly", "result", "resultAsync"];

		return {
			"Identifier"(node) 
			{
				if (targetedMethods.includes(node.name) && node.parent.type === "MemberExpression") 
				{
					// Only consider the direct .property access case, ensuring it's part of a member expression chain
					const tokenBeforeNode = sourceCode.getTokenBefore(node, { includeComments: false });
					if (tokenBeforeNode && tokenBeforeNode.type === "Punctuator" && tokenBeforeNode.value === ".")
					{
						const dotBeforeNode = tokenBeforeNode;
						const tokenBeforeDot = sourceCode.getTokenBefore(dotBeforeNode, { includeComments: false });
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
