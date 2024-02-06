module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: 2018,
        sourceType: "module",
        tsconfigRootDir: __dirname,
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:mocha/recommended",
        "prettier",
    ],
    plugins: [],
    rules: {
        "no-async-promise-executor": "off",
        "@typescript-eslint/no-floating-promises": ["error"],
        "@typescript-eslint/no-explicit-any": "off",
    },
    overrides: [
        {
            files: ["**/*.test.ts", "**/*.test.tsx"],
            rules: {
                "@typescript-eslint/no-unused-vars": ["off"],
            },
        },
    ],
};
