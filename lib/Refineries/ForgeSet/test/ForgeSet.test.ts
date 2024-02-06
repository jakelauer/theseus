import { expect } from "chai";

import { suite } from "@testdeck/mocha";

import { ForgeSet } from "../ForgeSet";

@suite("ForgeSet tests")
class ForgeSetTest {
    constructor() {}

    createForgeSet() {
        const forgeSet = ForgeSet.create({}, "immutableTest", {
            foo: () => {},
            bar: () => {},
        });

        expect(forgeSet).to.have.property("foo");
        expect(forgeSet).to.have.property("bar");
    }
}
