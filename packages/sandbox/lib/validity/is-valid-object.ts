function isPlainObject(obj: any) 
{
	return Object.prototype.toString.call(obj) === "[object Object]";
}

function isRealObject<T = object>(obj: any): obj is T
{
	const type = typeof obj;
	return type === "function" || type === "object" && !!obj;
}

export default function isValidObject<T = object>(obj: any): obj is T
{
	return isRealObject(obj) && isPlainObject(obj);
}
