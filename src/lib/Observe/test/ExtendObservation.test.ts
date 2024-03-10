import { expect } from 'chai';
import { describe, it } from 'mocha';

import extendObservation from '@Observe/ExtendObservation';
import { Observation } from '@Observe/Observation';

describe("ExtendObservation", () => {
    it("extends an Observation instance with evolveWith method", () => {
        const observation = new Observation<any>({} as any);
        const extended = extendObservation(observation);

        expect(extended).to.have.property("evolveWith");
        expect(extended.evolveWith).to.be.a("function");
    });
});
