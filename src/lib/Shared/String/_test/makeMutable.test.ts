import { expect } from "chai";

import { makeMutable } from "../makeMutable"; // Adjust the import path as necessary

describe("makeMutable", function () {
    it("should prevent modifications to the returned string/object", function () {
        const immutableString = makeMutable("test");
        expect(immutableString).to.equal("mutableTest");
    });
});
