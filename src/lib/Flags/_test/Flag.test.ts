import { expect } from "chai";
import { SinonStub, stub } from "sinon";

import { _logger_test_access, Flag } from "../Flag";

const logger = _logger_test_access;

describe("FlagWrapper", function () {
    let logWarnStub: SinonStub;

    beforeEach(function () {
        logWarnStub = stub(logger, "warn");
    });

    afterEach(function () {
        logWarnStub.restore();
    });

    it("should create a FlagWrapper instance with dynamic properties for an enum", function () {
        enum TestEnum {
            Read = 1 << 0, // 1
            Write = 1 << 1, // 2
            Execute = 1 << 2, // 4
        }

        const wrapper = Flag.fromEnum(TestEnum);

        expect(wrapper.Read).to.equal(TestEnum.Read);
        expect(wrapper.isRead(1)).to.be.true;
        expect(wrapper.isWrite(2)).to.be.true;
        expect(wrapper.isExecute(4)).to.be.true;
    });

    it("should correctly identify matching flag values", function () {
        enum TestEnum {
            Read = 1,
            Write = 2,
            Execute = 4,
        }

        const wrapper = Flag.fromEnum(TestEnum);

        expect(wrapper.isRead(1)).to.be.true;
        expect(wrapper.isRead(3)).to.be.true; // 3 (Read + Write)
        expect(wrapper.isWrite(2)).to.be.true;
        expect(wrapper.isExecute(4)).to.be.true;
        expect(wrapper.isExecute(7)).to.be.true; // 7 (Read + Write + Execute)
    });

    it("should handle non-string keys gracefully", function () {
        const enumDeclaration = { 1: "Read", Read: 1 };
        const wrapper = Flag.fromEnum(enumDeclaration);

        // Prevent TS from complaining about unused variable
        void wrapper;

        expect(
            logWarnStub.calledWith(
                "Skipping non-string key: 1. Only string keys are supported for flag enumerations.",
            ),
        ).to.be.true;
    });
});
