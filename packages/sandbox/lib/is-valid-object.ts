export default function isValidObject<T = object>(obj: any): obj is T
{
	const type = typeof obj;
	return type === "function" || type === "object" && !!obj;
}
