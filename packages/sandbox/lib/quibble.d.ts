declare module 'quibble' {
	export type QuibbleConfig = {
		defaultFakeCreator: (request: string) => any;
	};

	type Quibble = {
		<T = any>(request: string, stub?: any): T;
		config(userConfig: Partial<QuibbleConfig>): QuibbleConfig;
		ignoreCallsFromThisFile(file?: string): void;
		reset(hard?: boolean): void;
		absolutify(relativePath: string, parentFileName?: string): string;
		esm<TMockedType extends Record<string, any> = Record<string, any>>(
			specifier: string,
			namedExportStubs?:Partial<TMockedType>,
			defaultExportStub?: any
		): Promise<void>;
		listMockedModules(): string[];
		isLoaderLoaded(): boolean;
		esmImportWithPath(specifier: string): Promise<{
			modulePath: string;
			moduleUrl: string;
			module: any;
		}>;
	};

	const quibble: Quibble;
	const _default: Quibble;
	export { quibble, _default as default };
}
