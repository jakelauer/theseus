import { expect } from "chai";

import { ForgeSet } from "../";

describe("ForgeSet", function () {
    it("createForgeSet", function () {
        const forgeSet = ForgeSet.create({}, "immutableTest", {
            foo: () => {},
            bar: () => {},
        });

        expect(forgeSet).to.have.property("foo");
        expect(forgeSet).to.have.property("bar");
    });
});
