import { expect } from "chai";
import sinon from "sinon";

import getTheseusLogger from "@Shared/Log/getTheseusLogger"; // Adjust the import path as necessary

const buildMockingLib = () =>
    ({
        getLogger: sinon.stub().returns({
            debug: sinon.spy(),
            info: sinon.spy(),
            warn: sinon.spy(),
            error: sinon.spy(),
        }),
    }) as const;

describe("getLogger", function () {
    let mockLoggingLib: ReturnType<typeof buildMockingLib>;

    beforeEach(function () {
        // Create a mock logging library object with stubbed getLogger method
        mockLoggingLib = buildMockingLib();
    });

    it("should create a logger with the specified name using the mock logging library", function () {
        const loggerName = "testLogger";
        getTheseusLogger(loggerName, mockLoggingLib);

        // Verify getLogger was called with the correct name on the mock
        sinon.assert.calledWith(mockLoggingLib.getLogger, loggerName);
    });

    it("should return a logger instance with expected methods from the mock library", function () {
        const logger = getTheseusLogger("testLogger", mockLoggingLib);

        // Verify the returned logger has the expected methods
        expect(logger).to.have.all.keys(["debug", "info", "warn", "error"]);
        // Optionally, verify that these methods are indeed spies
        expect(logger.debug).to.be.a("function");
        expect(logger.info).to.be.a("function");
        expect(logger.warn).to.be.a("function");
        expect(logger.error).to.be.a("function");
    });
});
