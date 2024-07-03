export function sandboxTransform<
    T extends object, 
>(obj: T, transform: (obj: any) => any, predicate?: (val: any) => boolean): T
{
	const transformValue = (val: any): any => 
	{
		if (!predicate || predicate?.(val)) 
		{
			return transform(val);
		}
		else 
		{
			return val;
		}
	};

	for (const key in obj) 
	{
		if (Object.prototype.hasOwnProperty.call(obj, key)) 
		{
			const val = obj[key];
			const transformed = transformValue(val);
			obj[key] = transformed;
		}
	}

	return obj;
}
