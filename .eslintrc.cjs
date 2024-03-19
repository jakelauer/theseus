module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: 2018,
        sourceType: "module",
        tsconfigRootDir: "./",
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:mocha/recommended",
        "prettier",
    ],
    plugins: [],
    rules: {
        quotes: [2, "double", { avoidEscape: true }],
        "no-async-promise-executor": "off",
        "@typescript-eslint/no-floating-promises": ["error"],
        "@typescript-eslint/no-explicit-any": "off",
        "mocha/no-setup-in-describe": "off",
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
