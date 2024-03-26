export default {
    keys: <T extends object>(obj: T) => Object.keys(obj) as (keyof T)[],
} as const;
