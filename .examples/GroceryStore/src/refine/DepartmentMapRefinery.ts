import { DepartmentMap } from "state/substate/DepartmentMap";
import { DepartmentNames } from "state/substate/Departments";
import { StaffMember } from "state/substate/StaffState";
import { Refinery } from "theseus-js";

export const { DepartmentMapRefinery } = Refinery.create("DepartmentMapRefinery", { noun: "map" })
    .toRefine<DepartmentMap>()
    .withForges({
        /**
         * Find staff members who are the only ones eligible to work in a given department, and
         * return one map of singletons, and another map of the rest of the staff
         */
        filterSingletons: ({ immutableMap }) => {
            const singletons = new Map<DepartmentNames, StaffMember>();
            const rest: DepartmentMap = new Map<DepartmentNames, StaffMember[]>();

            for (const [department, staff] of immutableMap) {
                if (staff.length === 1) {
                    singletons.set(department, staff[0]);
                } else {
                    rest.set(department, staff);
                }
            }

            return { singletons, rest };
        },
        /**
         * Sort the staff members by their expertise in descending order. Specializations are stored
         * as bit flags, so the number of 1s in the binary representation of the number is the
         * number of specializations the staff member has.
         */
        sortStaffByExpertise: ({ immutableMap }) => {
            const flatStaffList = Object.values(immutableMap).flat() as StaffMember[];
            return flatStaffList.sort((a, b) => {
                const aSpecializations = a.specializations.toString(2).split("1").length - 1;
                const bSpecializations = b.specializations.toString(2).split("1").length - 1;
                return bSpecializations - aSpecializations;
            });
        },
    });
