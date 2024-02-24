import { StoreState } from "state/StoreState";
import { DepartmentNames } from "state/substate/Departments";
import { Evolver } from "theseus-js";

export const { StoreDepartmentEvolver } = Evolver.create("StoreDepartmentEvolver", {
    noun: "store",
})
    .toEvolve<StoreState>()
    .withMutators({
        assignToDepartment: (
            { mutableStore },
            department: DepartmentNames,
            staffMemberId: string,
        ) => {
            if (!mutableStore.staffAssignments[department]) {
                mutableStore.staffAssignments[department] = [];
            }
            mutableStore.staffAssignments[department].push(staffMemberId);
            return mutableStore;
        },
    });
