const isBrowserContext = typeof window !== "undefined";
const debugFlagExists = !isBrowserContext && process.argv.includes("--debug-mode");

export const isTestMode = () => debugFlagExists;
