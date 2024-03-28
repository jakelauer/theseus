import { expect } from "chai";
import sinon from "sinon";
import type { logLevels } from "../set-theseus-log-level";
import { setTheseusLogLevel } from "../set-theseus-log-level";

describe("Set Theseus Log Level", function () {
    let levelSetCall: sinon.SinonStub;

    afterEach(function () {
        // Restore the original console transport behavior
        sinon.restore();
    });

    it("should not throw an error for an unrecognized log level", function () {
        const invalidLevel = "notALogLevel";
        expect(() => setTheseusLogLevel(invalidLevel as keyof typeof logLevels)).not.to.throw();
        // Since the invalid level is not set, the last valid level should remain
        // This assertion depends on the behavior of the logger when an invalid level is set
        // Adjust the expected outcome based on your logger's behavior
    });
});
