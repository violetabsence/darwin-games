import { getRandomInt } from "../utils";
import { Result } from "./Result";

export async function getOrAwait<TOut>(result: Result<TOut>): Promise<TOut> {
    if (result && typeof (result as Promise<TOut>).then === "function") {
        return await result;
    }

    return result;
}

export function getOrAwaitAll<TIn, TOut>(inputs: TIn[], map: (input: TIn, index: number) => Result<TOut>)
    : Promise<TOut[]> {
    const promises = inputs.map(map);
    return Promise.all(promises);
}

export function validateInteger(value: number, name: string): void {
    if (!Number.isInteger(value)) throw new Error(`Value of '${name}' must have integer value.`);
}

export function validateRange(value: number, name: string, min?: number, max?: number): void {
    if (min !== undefined && value < min) throw new Error(`Value of '${name}' cannot be less than '${min}'.`);
    if (max !== undefined && value > max) throw new Error(`Value of '${name}' be higher than '${max}'.`);
}

export function validateEquals(values: number[], error: string): number {
    const value = values[0] ?? 0;
    if (values.length < 2) return value;

    const equals = values.findIndex((v) => v !== value) === -1;
    if (!equals) throw new Error(error);

    return value;
}

export function getRandomUniqueIntegers(count: number, min: number, max: number): number[] {
    const range = max - min + 1;
    count = Math.min(count, range);

    const possibleValues = new Array(range).fill(undefined).map((_, i) => i + min);
    const values: number[] = [];
    while (count-- > 0) {
        const index = getRandomInt(0, possibleValues.length - 1);
        const value = possibleValues.splice(index, 1)[0];
        values.push(value);
    }

    return values.sort((a, b) => a - b);
}
