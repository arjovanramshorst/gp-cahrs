import NUMBER_COMPARISON, {NumberComparisonType} from "./number.property.ts";
import ARRAY_COMPARISON, {ArrayComparisonType} from "./array.property.ts";
import STRING_COMPARISON, {StringComparisonType} from "./string.property.ts";

export type PropertyFunction<T> = (input: T, compare: T) => number

export type StringFunction = PropertyFunction<string>

export type NumberFunction = PropertyFunction<number>

export type ArrayFunction<T> = PropertyFunction<T[]>

export type ComparisonType = NumberComparisonType | ArrayComparisonType | StringComparisonType

export function compare(comparisonType: ComparisonType): PropertyFunction<any> {
    switch (comparisonType) {
        case "numberDistance":
            return NUMBER_COMPARISON.numberDistance

        case "arrayDistance":
            return ARRAY_COMPARISON.arrayDistance

        case "stringSame":
            return STRING_COMPARISON.stringSame
    }
}