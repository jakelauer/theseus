export type AtLeastOnePropertyOfType<T, K extends keyof T, V> = {
    [P in K]: T[P] extends V ? P : never;
}[K];

export type AtLeastOneItemOfType<T> = [T, ...any[]] | [...any[], T];
