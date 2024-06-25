module.exports = {
    parser: "@typescript-eslint/parser",  
	//ignorePatterns: ["*.js"],
    parserOptions: {  
        project: [
			"./.examples/tic-tac-toe/tsconfig.json",
			"./tsconfig.tsup.json",
			"./tsconfig.base.json",
			"./packages/commitlint-config/tsconfig.json",
			"./packages/sandbox/tsconfig.tsup.json",
			"./packages/sandbox/tsconfig.json",
			"./packages/eslint-plugin-theseus/tsconfig.json",
			"./tsconfig.json"
		],
        ecmaVersion: 2018,  
        sourceType: "module",  
        tsconfigRootDir: "./",  
    },  
    extends: [  
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",  
        "plugin:mocha/recommended",  
        "prettier",
		"plugin:theseus/recommended"
    ],  
	settings: {
		'import/resolver': {
			node: {
			  paths: ["eslint-rules"]
			}
		  }
	},
    plugins: ["unused-imports", "@stylistic"],  
    rules: {  
		"indent": ["error", "tab", { "SwitchCase": 1 }],
        quotes: [2, "double", { avoidEscape: true }],  
        "unused-imports/no-unused-imports": "error",  
        "no-async-promise-executor": "off",  
        "mocha/no-setup-in-describe": "off",
		"@stylistic/object-property-newline": ["error"],
		"@stylistic/object-curly-newline": ["error", {
			"ObjectExpression": { "multiline": true, "minProperties": 1 },
			"ObjectPattern": { "multiline": true, "minProperties": 3 },
			"ImportDeclaration": { "multiline": true, "minProperties": 3 },
			"ExportDeclaration": { "multiline": true, "minProperties": 2 }
		}],
        "@typescript-eslint/no-floating-promises": ["error"],  
        "@typescript-eslint/no-explicit-any": "off",  
        "@typescript-eslint/consistent-type-imports": "error",  
        "@typescript-eslint/no-unused-vars": [  
            "error",  
            {  
                args: "all",  
                argsIgnorePattern: "^_",  
                caughtErrors: "all",  
                caughtErrorsIgnorePattern: "^_",  
                destructuredArrayIgnorePattern: "^_",  
                varsIgnorePattern: "^_",  
                ignoreRestSiblings: true,  
            },  
        ],
        "semi": ["error", "always"],
        "comma-dangle": ["error", "always-multiline"],
        "array-bracket-spacing": ["error", "never"],
        "object-curly-spacing": ["error", "always"],
        "max-len": ["error", { "code": 180, "ignoreUrls": true, "ignoreTemplateLiterals": true, "ignoreStrings": true }],
        "arrow-parens": ["error", "always"],
        "no-tabs": "off", // Since you're using tabs
        "key-spacing": ["error", { "beforeColon": false, "afterColon": true }],
        "keyword-spacing": ["error", { "before": true, "after": true }],	
		"brace-style": ["error", "allman", { "allowSingleLine": true }],
    },  
    overrides: [  
        {  
            files: ["**/*.test.ts"],  
            rules: {  
                "@typescript-eslint/no-unused-vars": ["off"],  
            },  
        },  
    ],  
};
