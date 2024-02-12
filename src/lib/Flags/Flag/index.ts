import log from "@Shared/Log/log";
import { capitalizeFirstLetter } from "@Shared/String/capitalizeFirstLetter";

/**
 * Represents a wrapper around a flag enumeration, providing utility methods
 * for working with flag values and their corresponding enumeration keys.
 * @template TEnum - The enumeration type that this class will wrap.
 */
class FlagWrapper<TEnum extends FlagEnumType> {
    /**
     * Creates an instance of FlagWrapper.
     * @param {TEnum} enumDeclaration - The enumeration declaration to be wrapped.
     */
    private constructor(enumDeclaration: TEnum) {
        const enumKeys = Object.keys(enumDeclaration) as (keyof FlagEnumType)[];
        enumKeys.forEach((ambiguousKey: string | number) => {
            const keyIsString = isNaN(Number(ambiguousKey));
            if (keyIsString) {
                const key = ambiguousKey as string;
                const capitalized = capitalizeFirstLetter(key);

                // Dynamically add properties to the FlagWrapper instance:
                // 1. The enumeration value itself (e.g., this[key]).
                // 2. A function to test if a provided value matches the flag value (e.g., `is${Capitalized}`).
                Object.assign(this, {
                    [key]: enumDeclaration[key],
                    [`is${capitalized}`]: (value: number) =>
                        this.matches(value, enumDeclaration[key] as number),
                });

                log.debug(`Added enumeration key: ${key} with value: ${enumDeclaration[key]}`);
            } else {
                log.warn(
                    `Skipping non-string key: ${ambiguousKey}. Only string keys are supported for flag enumerations.`,
                );
            }
        });

        log.debug(`Created FlagWrapper for enumeration: ${enumKeys.join(", ")}`);
    }

    /**
     * Checks if the provided value matches against a specific flag value.
     * @private
     */
    private matches(value: number, against: number) {
        return value === (value & against);
    }

    /**
     * Creates a new FlagWrapper instance from a given enumeration.
     * @static
     * @param {TEnum} enumDeclaration - The enumeration declaration to be wrapped.
     * @returns {FlagWithEnumProps<TEnum>} An instance of FlagWrapper with additional enumeration properties.
     */
    public static fromEnum<TEnum extends FlagEnumType>(
        enumDeclaration: TEnum,
    ): FlagWithEnumProps<TEnum> {
        log.debug(
            `Creating FlagWrapper from enumeration: ${Object.keys(enumDeclaration).join(", ")}`,
        );
        return new FlagWrapper<TEnum>(enumDeclaration) as unknown as FlagWithEnumProps<TEnum>;
    }
}

/**
 * Represents the type for flag enumerations.
 */
type FlagEnumType = { [s: string]: number | string };

/**
 * Represents a utility type to construct flag test method names.
 */
type FlagTest<T extends string> = `is${Capitalize<T>}`;

/**
 * Represents an object type with flag test methods.
 */
type FlagTestObj<T extends Record<string, any>> = {
    [K in keyof T as FlagTest<K & string>]: (value: number) => boolean;
};

/**
 * Represents the type for a FlagWrapper instance with additional enumeration properties.
 */
type FlagWithEnumProps<TEnum extends FlagEnumType> = FlagWrapper<TEnum> & {
    [K in keyof TEnum]: TEnum[K];
} & FlagTestObj<TEnum>;

export const Flag = FlagWrapper;
