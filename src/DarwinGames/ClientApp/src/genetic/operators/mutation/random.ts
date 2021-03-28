import { getRandomInt } from "../../../utils";
import { Mutation } from "../../definitions";
import { IChromosome } from "../../IChromosome";
import { getRandomUniqueIntegers, validateRange } from "../../utils";

export function random<TGene, TChromosome extends IChromosome<TGene>>(
    count: number,
    mutate: (gene: TGene, generation: number) => TGene): Mutation<TGene, TChromosome> {
    validateRange(count, "count", 1);

    return (chromosome, generation) => {
        const genes = chromosome.genes.slice();
        const maxRandom = Math.min(count, genes.length) - 1;
        const indexes = getRandomUniqueIntegers(count, 0, maxRandom);
        indexes.forEach((i) => genes[i] = mutate(genes[i], generation));

        chromosome.genes = genes;
    };
}

export function randomNumeric<TChromosome extends IChromosome<number>>(count: number, factor: number)
    : Mutation<number, TChromosome> {
    return random<number, TChromosome>(count, (gene) => {
        const negative = getRandomInt(0, 1) === 1;
        const shift = factor * gene * (negative ? -1 : 1);
        return gene + shift;
    });
}
