import { DepartmentMapRefinery } from "refine/DepartmentMapRefinery";
import { StoreState } from "state/StoreState";
import { DepartmentMap } from "state/substate/DepartmentMap";
import Departments, { DepartmentNames } from "state/substate/Departments";
import { StaffMember } from "state/substate/StaffState";
import { Refinery } from "theseus-js";

export const { StoreRefinery } = Refinery.create("StoreRefinery", { noun: "store" })
    .toRefine<StoreState>()
    .withForges({
        internal: {
            getElligible: ({ immutableStore }, departmentId: DepartmentNames) => {
                const department = immutableStore.departments[departmentId];
                const activeStaff = Object.keys(immutableStore.staff.activeStatus).map(
                    (id) => immutableStore.staff.members[id],
                );
                const ellibleStaff = activeStaff.filter((staff) => {
                    // Check if the staff member has the required specializations using bitwise AND
                    return staff.specializations & department.specializations;
                });
                return ellibleStaff;
            },
            buildElligibilityMap: ({ immutableStore }) => {
                const { departments } = StoreRefinery.refine(immutableStore).getForges();

                const map = new Map<DepartmentNames, StaffMember[]>();

                for (const deptNameString in Departments) {
                    const departmentName = deptNameString as DepartmentNames;
                    const validDepartmentStaff = departments.staff.getElligible(departmentName);
                    map.set(departmentName, validDepartmentStaff);
                }

                return map as DepartmentMap;
            },
            assertSufficientStaff: ({ immutableStore }) => {
                const totalMinStaff = Object.values(immutableStore.departments).reduce(
                    (acc, dept) => acc + dept.minStaff,
                    0,
                );
                const totalStaff = Object.keys(immutableStore.staff.activeStatus).length;
                if (totalStaff < totalMinStaff) {
                    throw new Error(
                        `Insufficient staff to cover all departments. Required: ${totalMinStaff}, available: ${totalStaff}`,
                    );
                }
            },
        },
        determineStaffAssignments: ({ immutableStore }) => {
            const { assertSufficientStaff, buildElligibilityMap } =
                StoreRefinery.refine(immutableStore).getForges().internal;

            assertSufficientStaff();
            const elligibilityMap = buildElligibilityMap();

            const { filterSingletons, sortStaffByExpertise: staffSortedByExpertise } =
                DepartmentMapRefinery.refine(elligibilityMap).getForges();
            const { singletons, rest } =
                DepartmentMapRefinery.refine(elligibilityMap).using.filterSingletons();
            const sortedRest = DepartmentMapRefinery.refine(rest).using.sortStaffByExpertise();
        },
    });
