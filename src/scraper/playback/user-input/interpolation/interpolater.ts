import { nCopies } from "@common/utils/functional-utils";

export function interpolator<T>(nIntermediate: number, interpolators: InterpolationTypes<T>) {
    const interpolated = Object.entries(interpolators)
        .map(([key, intFn]) => {
            return {
                key,
                values: intFn(nIntermediate)
            }
        });

    return function interpolate(fromA: T, toB: T): T[] {
        const additional: T[] = []
        for(let i = 0; i < nIntermediate; i++) {
            additional.push({ ...fromA as any });
        }
        interpolated.forEach((int) => {
            int.values(fromA[int.key], toB[int.key]).forEach((val, i) => {
                additional[i][int.key] = val;
            })
        });
        return [fromA, ...additional, toB]
    }
}

export const linear: InterpolationFunction<number> = (nVals) => {
    const numSteps = nVals + 1;
    return function(first: number, second: number) {
        const res: number[] = [];
        const diff = (second - first) / numSteps;
        for(let i = 1; i < numSteps; i++) {
            res.push(first + diff * i); 
        }
        return res;
    }
}

export const flipHalfway: InterpolationFunction<any> = (numSteps: number) => {
    return function<T>(first: T, second: T) {
        return [
            ...nCopies(first, Math.floor(numSteps / 2)),
            ...nCopies(second, Math.ceil(numSteps / 2))
        ]
    }
}

export type InterpolationTypes<T> = {
    [field in keyof T]?: InterpolationFunction<T[field]>;
}

export type InterpolationFunction<F> = (numSteps: number) => (first: F, second: F) => F[];
