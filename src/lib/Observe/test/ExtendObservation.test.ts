import { expect } from 'chai';
import { describe, it } from 'mocha';

import extendObservation from '@Observe/TheseusBuilder';

describe("ExtendObservation", () => {
    it("extends an Observation instance with evolveWith method", () => {
        const extended = extendObservation({ initialData: {} });

        expect(extended).to.have.property("with");
    });
});
