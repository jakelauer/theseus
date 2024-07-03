export function symbolCompare(sym1: any, sym2: any) 
{
	if (typeof sym1 !== "symbol" || typeof sym2 !== "symbol")
	{
		return {
			equal: false,
			looseEqual: false,
		};
	}
	
	return {
		equal: sym1 === sym2,
		looseEqual: sym1.toString() === sym2.toString(),
	};
}
