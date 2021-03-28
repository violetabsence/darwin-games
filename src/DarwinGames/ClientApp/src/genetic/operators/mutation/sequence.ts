import { getRandomInt, shuffleArray } from "../../../utils";
import { Mutation } from "../../definitions";
import { IChromosome } from "../../IChromosome";
import { validateRange } from "../../utils";

export function sequence<TGene, TChromosome extends IChromosome<TGene>>(
    factor: number,
    mutate: (genes: TGene[], generation: number) => TGene[]): Mutation<TGene, TChromosome> {
    validateRange(factor, "factor", 0, 1);

    return (chromosome, generation) => {
        const genes = chromosome.genes;
        const length = Math.floor(genes.length * factor);
        const offset = getRandomInt(0, genes.length - length);
        const section = genes.slice(offset, offset + length);
        const mutatedSection = mutate(section, generation);
        if (mutatedSection.length !== section.length) {
            throw new Error(`Invalid section length: '${mutatedSection.length}'. Should be: '${section.length}'.`);
        }

        const prefix = genes.slice(0, offset);
        const suffix = genes.slice(offset + section.length, genes.length);
        const resultGenes = prefix.concat(section).concat(suffix);

        chromosome.genes = resultGenes;
    };
}

export function scrambleSequence<TGene, TChromosome extends IChromosome<TGene>>(factor: number)
    : Mutation<TGene, TChromosome> {
    return sequence<TGene, TChromosome>(factor, (section) => shuffleArray(section));
}

export function inverseSequence<TGene, TChromosome extends IChromosome<TGene>>(factor: number)
    : Mutation<TGene, TChromosome> {
    return sequence<TGene, TChromosome>(factor, (section) => section.reverse());
}
