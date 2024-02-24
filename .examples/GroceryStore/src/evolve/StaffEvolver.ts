import { StaffRefinery } from "refine/StaffRefinery";
import { ShiftType, StaffState } from "state/substate/StaffState";
import { Evolver } from "theseus-js";

export const {} = Evolver.create("StaffEvolver", { noun: "staff" })
    .toEvolve<StaffState>()
    .withMutators({
        /** Add a staff member to the store. */
        addStaffMember: ({ mutableStaff }, staffMember) => {
            mutableStaff.members[staffMember.id] = staffMember;
            return mutableStaff;
        },
        /** Remove a staff member from the store. */
        removeStaffMember: ({ mutableStaff }, staffMemberId) => {
            delete mutableStaff.members[staffMemberId];

            return mutableStaff;
        },
        /** Add a shift to the store. */
        addStaffToShift: (
            { mutableStaff },
            shiftDay: Date,
            shiftType: ShiftType,
            staffMemberId: string,
        ) => {
            const date = shiftDay.getDate();
            if (!(date in mutableStaff.schedule)) {
                mutableStaff.schedule[date] = {
                    earlyShift: { staffIds: [] },
                    lateShift: { staffIds: [] },
                };
            }

            mutableStaff.schedule[date][shiftType].staffIds.push(staffMemberId);

            return mutableStaff;
        },
        /** Remove a staff member from a shift. */
        removeStaffFromShift: (
            { mutableStaff },
            shiftDay: Date,
            shiftType: ShiftType,
            staffMemberId: string,
        ) => {
            const date = shiftDay.getDate();
            const shift = mutableStaff.schedule[date]?.[shiftType];
            if (!shift) throw new Error(`No shift found for date ${date} and type ${shiftType}`);

            shift.staffIds = shift.staffIds.filter((id) => id !== staffMemberId);

            return mutableStaff;
        },
        /** Update the active status of all staff members based on the current time and schedule. */
        updateActiveStatuses: ({ mutableStaff }) => {
            const activeStatuses = StaffRefinery.refine(mutableStaff).using.getAllActiveStatuses();
            mutableStaff.activeStatus = activeStatuses;
            return mutableStaff;
        },
    });
