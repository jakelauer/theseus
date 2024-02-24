import { DepartmentNames } from "state/substate/Departments";
import { DepartmentState } from "state/substate/DepartmentState";
import { StaffState } from "state/substate/StaffState";

export interface StoreState {
    departments: Record<DepartmentNames, DepartmentState>;
    staff: StaffState;
    staffAssignments: Record<DepartmentNames, string[]>;
}
