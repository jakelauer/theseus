import { Specializations } from "state/substate/Specializations";
import { ShiftType, StaffState } from "state/substate/StaffState";
import { Refinery } from "theseus-js";

export const { StaffRefinery } = Refinery.create("StaffRefinery", { noun: "staff" })
    .toRefine<StaffState>()
    .withForges({
        /** Forge a staff member from their id. */
        memberFromId: ({ immutableStaff }, staffMemberId: string) => {
            if (!immutableStaff.members[staffMemberId]) {
                throw new Error(`No staff member with id ${staffMemberId}`);
            }
            return immutableStaff.members[staffMemberId];
        },
        getAllActiveStatuses: ({ immutableStaff }) => {
            const date = new Date().getDate();
            const today = immutableStaff.schedule[date];
            const shiftType = new Date().getHours() < 15 ? "earlyShift" : "lateShift";
            const shift = today[shiftType];
            const activeStatuses = Object.values(immutableStaff.members).reduce(
                (acc, member) => {
                    acc[member.id] = shift.staffIds.includes(member.id);
                    return acc;
                },
                {} as Record<string, boolean>,
            );

            return activeStatuses;
        },
        /** Check if a staff member is active at a given time. */
        isMemberIdActive: (
            { immutableStaff },
            staffMemberId: string,
            atTime?: { date: Date; shift: ShiftType },
        ) => {
            const now = new Date();
            const { date, shift } = atTime ?? {
                date: now,
                shift: now.getHours() < 15 ? "earlyShift" : "lateShift",
            };
            const scheduleDay = date.getDate();
            const staffForShift = immutableStaff.schedule[scheduleDay][shift];
            const member = staffForShift.staffIds.includes(staffMemberId);
            return !!member;
        },
        /** Check if a staff member has a given specialization. */
        memberHasSpecialization: (
            { immutableStaff },
            staffMemberId: string,
            specialization: Specializations,
        ) => {
            const member = immutableStaff.members[staffMemberId];

            return member.specializations & specialization;
        },
    });
