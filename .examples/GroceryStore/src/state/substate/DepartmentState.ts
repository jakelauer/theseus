import { Specializations } from "state/substate/Specializations";

export interface DepartmentState {
    id: string;
    name: string;
    specializations: Specializations;
    minStaff: number;
}

export interface Product {
    id: string;
    name: string;
    price: number;
}
