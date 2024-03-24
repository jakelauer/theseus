import { expect } from "chai";
import sinon from "sinon";
import { theseusTransports } from "../winston-config-builder";
import { setTheseusLogLevel, logLevels } from "../set-theseus-log-level";

describe("Set Theseus Log Level", () => {
    let levelSetCall: sinon.SinonStub;

    beforeEach(() => {
        // Check if the level property exists and is configurable on theseusTransports.console
        const levelDescriptor = Object.getOwnPropertyDescriptor(theseusTransports.console, "level");
        if (levelDescriptor && levelDescriptor.configurable) {
            // Stub the level property to intercept sets without actually modifying the property
            levelSetCall = sinon.stub(theseusTransports.console, "level").set((value) => {
                // Optionally, store the set value for later verification if needed
                (levelSetCall as any).lastValue = value;
            });
        }
    });

    afterEach(() => {
        // Restore the original console transport behavior
        sinon.restore();
    });

    Object.keys(logLevels).forEach((level) => {
        it(`should set the log level to ${level}`, () => {
            setTheseusLogLevel(level as keyof typeof logLevels);
            expect((levelSetCall as any).lastValue).to.equal(level); // Verify the last set value
        });
    });

    it("should silence the logger when the level is set to 'silent'", () => {
        setTheseusLogLevel("silent");
        expect(theseusTransports.console.silent).to.be.true;
    });

    it("should not throw an error for an unrecognized log level", () => {
        const invalidLevel = "notALogLevel";
        expect(() => setTheseusLogLevel(invalidLevel as keyof typeof logLevels)).not.to.throw();
        // Since the invalid level is not set, the last valid level should remain
        // This assertion depends on the behavior of the logger when an invalid level is set
        // Adjust the expected outcome based on your logger's behavior
    });
});
