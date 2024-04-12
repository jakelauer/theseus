module.exports = {
	meta: {
	  type: "suggestion",
	  docs: {
		description: "enforce line breaks before .and, .via, .lastly, .result, and .resultAsync in method chains",
		category: "Stylistic Issues",
		recommended: false,
	  },
	  fixable: "whitespace",  // This rule is automatically fixable
	  schema: []  // No options by default
	},
  
	create(context) {
	  return {
		'CallExpression > MemberExpression[property.type="Identifier"]'(node) {
		  const propertyName = node.property.name;
		  const propertiesToCheck = ['and', 'via', 'lastly', 'result', 'resultAsync'];
  
		  if (propertiesToCheck.includes(propertyName)) {
			const sourceCode = context.getSourceCode();
			const tokenBefore = sourceCode.getTokenBefore(node);
  
			if (tokenBefore && tokenBefore.loc.end.line === node.loc.start.line) {
			  // Report the lack of a line break before the property
			  context.report({
				node,
				message: `Expected line break before .${propertyName}`,
				fix(fixer) {
				  return fixer.insertTextBefore(node, '\n');
				}
			  });
			}
		  }
		}
	  };
	}
  };
  
