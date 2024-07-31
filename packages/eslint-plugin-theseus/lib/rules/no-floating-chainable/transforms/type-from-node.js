/* eslint-env node */
const typeFromNode = (node, context) => 
{
	const { program, esTreeNodeToTSNodeMap } = context.sourceCode.parserServices;

	const typeChecker = program.getTypeChecker();
	const typescriptNode = esTreeNodeToTSNodeMap.get(node);
	const type = typeChecker.getTypeAtLocation(typescriptNode);
	return type;
};

module.exports = typeFromNode;
