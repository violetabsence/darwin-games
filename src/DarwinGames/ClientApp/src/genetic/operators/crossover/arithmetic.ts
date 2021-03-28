import { Crossover } from "../../definitions";
import { IChromosome } from "../../IChromosome";
import { IIndividual } from "../../IIndividual";
import { getOrAwait, validateRange } from "../../utils";
import { combine as combineCrossover } from "./combine";

export function arithmetic<
    TFitness,
    TChromosome extends IChromosome<number>,
    TIndividual extends IIndividual<number, TFitness, TChromosome>>(
    combine: (genes: number[], geneIndex: number, generation: number) => number[],
    singleOffspring: boolean = false): Crossover<number, TFitness, TChromosome, TIndividual> {
    const crossover = combineCrossover<number, TFitness, TChromosome, TIndividual>(combine);

    return async (individuals, generation, optimize) => {
        if (individuals.length !== 2) {
            throw new Error("Unable to apply crossover: mates count should be 2.");
        }

        const offsprings = await getOrAwait(crossover(individuals, generation, optimize));
        return singleOffspring ? [offsprings[0]] : offsprings;
    };
}

export function wholeArithmeticRecombination<
    TFitness,
    TChromosome extends IChromosome<number>,
    TIndividual extends IIndividual<number, TFitness, TChromosome>>(
    factor: number,
    singleOffspring: boolean = false): Crossover<number, TFitness, TChromosome, TIndividual> {
    validateRange(factor, "factor", 0, 1);
    return arithmetic<TFitness, TChromosome, TIndividual>((genes) => {
        const result = factor * genes[0] + (1 - factor) * genes[1];
        return [result, result];
    }, singleOffspring);
}
