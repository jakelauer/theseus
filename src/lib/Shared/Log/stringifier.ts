const isPrimitive = (obj: object) =>
    obj === null || ["string", "number", "boolean", "object"].includes(typeof obj);

const isArrayOfPrimitive = (obj: object) => Array.isArray(obj) && obj.every(isPrimitive);

const format = (arr: any[]) => `^^^[ ${arr.map((val) => JSON.stringify(val)).join(", ")} ]`;

const replacer = (_key: any, value: any) => (isArrayOfPrimitive(value) ? format(value) : value);

const expand = (str: string) =>
    str.replace(/(?:"\^\^\^)(\[ .* \])(?:")/g, (_match, a) => a.replace(/\\"/g, '"'));

export const stringifier = (obj: object) => expand(JSON.stringify(obj, replacer, 2));
