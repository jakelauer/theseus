import { Specializations } from "state/substate/Specializations";

export interface StaffState {
    members: Record<string, StaffMember>;
    schedule: Record<number, ScheduleDay>;
    activeStatus: Record<string, boolean>;
}

export interface StaffMember {
    id: string;
    name: string;
    specializations: Specializations;
}

interface ScheduleDay {
    earlyShift: Shift;
    lateShift: Shift;
}

interface Shift {
    staffIds: string[];
}

export type ShiftType = keyof ScheduleDay;
