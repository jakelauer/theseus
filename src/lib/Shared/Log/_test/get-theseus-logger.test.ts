import { expect } from "chai";
import sinon from "sinon";
import * as winston from "winston";

import getTheseusLogger, { MockLoggingLib } from "@Shared/Log/get-theseus-logger"; // Adjust the import path as necessary
import winstonConfigBuilder from "@Shared/Log/winston-config-builder";

describe("getLogger", function () {
    let mockLoggingLib: sinon.SinonStub<[string], MockLoggingLib>;

    beforeEach(function () {
        // Create a mock logging library object with stubbed getLogger method
        mockLoggingLib = sinon.stub<[string], MockLoggingLib>().returns({
            debug: sinon.spy(),
            info: sinon.spy(),
            warn: sinon.spy(),
            error: sinon.spy(),
            verbose: sinon.spy(),
            silly: sinon.spy(),
            major: sinon.spy(),
            format:
                winstonConfigBuilder("test").config.format ??
                winston.format(() => {
                    return true;
                })(),
        });
    });

    it("should create a logger with the specified name using the mock logging library", function () {
        const loggerName = "testLogger";
        getTheseusLogger(loggerName, undefined, mockLoggingLib);

        // Verify getLogger was called with the correct name on the mock
        sinon.assert.calledWith(mockLoggingLib, loggerName);
    });

    it("should return a logger instance with expected methods from the mock library", function () {
        const logger = getTheseusLogger("testLogger", undefined, mockLoggingLib);

        // Verify the returned logger has the expected methods
        expect(logger).to.have.all.keys(["debug", "info", "warn", "error"]);
        // Optionally, verify that these methods are indeed spies
        expect(logger.debug).to.be.a("function");
        expect(logger.info).to.be.a("function");
        expect(logger.warn).to.be.a("function");
        expect(logger.error).to.be.a("function");
    });
});
