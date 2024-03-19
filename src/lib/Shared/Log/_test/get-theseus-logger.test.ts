import { expect } from "chai";
import sinon from "sinon";
import * as winston from "winston";

import getTheseusLogger from "@Shared/Log/get-theseus-logger"; // Adjust the import path as necessary
import winstonConfigBuilder from "@Shared/Log/winston-config-builder";

import type { MockLoggingLib } from "@Shared/Log/get-theseus-logger"; // Adjust the import path as necessary
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

        const keys = ["debug", "info", "warn", "error", "major", "silly", "verbose"];

        // Verify the returned logger has the expected methods
        expect(logger).to.have.all.keys([...keys, "format"]);
        // Optionally, verify that these methods are indeed spies
        keys.forEach((key: any) => {
            expect((logger as any)[key]).to.be.a("function");
        });
    });
});
