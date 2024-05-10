/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const RuleTester = require("eslint").RuleTester;
const rule = require("../rules/break-on-chainable");

// Use the appropriate parser if dealing with specific ECMAScript versions or TypeScript
const ruleTester = new RuleTester({
    parserOptions: { ecmaVersion: 2020, sourceType: "module" },
});

ruleTester.run("break-on-chainable", rule, {
    valid: [
        {
            code: "obj.via.thing()\n.and.anotherThing()",
        },
        {
            code: "obj.via.thing()\n.lastly.thing()",
        },
        {
            code: "obj.via.thing()\n.result",
        },
        {
            code: "obj.via.thing()\n.resultAsync",
        },
    ],
    invalid: [
        {
            code: "obj.via.thing().and.anotherThing().lastly.thing();",
            errors: [
                { message: "Expected line break before `.and`." },
                { message: "Expected line break before `.lastly`." },
            ],
            output: "obj.via.thing()\n.and.anotherThing()\n.lastly.thing();",
        },
        {
            code: "obj.via.thing().result;",
            errors: [
                { message: "Expected line break before `.result`." },
            ],
            output: "obj.via.thing()\n.result;",
        },
        {
            code: "obj.via.thing().resultAsync;",
            errors: [
                { message: "Expected line break before `.resultAsync`." },
            ],
            output: "obj.via.thing()\n.resultAsync;",
        },
        {
            code: "GameMeta.iterateTurnCount().and.updateLastPlayer(mark).and.updateLastPlayedCoords(coords);",
            errors: [
                { message: "Expected line break before `.and`." },
                { message: "Expected line break before `.and`." },
            ],
            output: "GameMeta.iterateTurnCount()\n.and.updateLastPlayer(mark)\n.and.updateLastPlayedCoords(coords);",
        },
    ],
});
