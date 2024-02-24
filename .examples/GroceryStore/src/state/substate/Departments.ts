const Departments = [
    "Paint",
    "Tools",
    "Plumbing",
    "Electrical",
    "Gardening",
    "Appliances",
    "Lumber",
    "Flooring",
] as const;

export type DepartmentNames = (typeof Departments)[number];

export default Departments as ReadonlyArray<DepartmentNames>;
