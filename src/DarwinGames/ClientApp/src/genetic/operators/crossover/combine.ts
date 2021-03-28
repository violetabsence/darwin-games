import { Crossover, Optimization } from "../../definitions";
import { IChromosome } from "../../IChromosome";
import { IIndividual } from "../../IIndividual";
import { validateEquals } from "../../utils";

export function combine<
    TGene,
    TFitness,
    TChromosome extends IChromosome<TGene>,
    TIndividual extends IIndividual<TGene, TFitness, TChromosome>>(
    combine: (
        genes: TGene[],
        geneIndex: number,
        generation: number,
        optimize: Optimization<TGene, TFitness, TChromosome, TIndividual>) => TGene[])
    : Crossover<TGene, TFitness, TChromosome, TIndividual> {
    return (individuals, generation, optimize) => {
        const geneCount = validateEquals(
            individuals.map((i) => i.chromosome.genes.length),
            "Unable to apply crossover: chromosomes must have same count of genes.");

        const chromosomes = individuals.map((i) => i.chromosome.clone() as TChromosome);
        const allGenes = chromosomes.map((c) => c.genes.slice());

        for (let geneIndex = 0; geneIndex < geneCount; geneIndex++) {
            const genes = allGenes.map((g) => g[geneIndex]);
            const result = combine(genes, geneIndex, generation, optimize);
            if (genes.length !== result.length) {
                throw new Error("Unable to apply crossover: combination gene count differs from input genes.");
            }

            allGenes.forEach((g, i) => g[geneIndex] = result[i]);
        }

        chromosomes.forEach((c, i) => c.genes = allGenes[i]);
        return chromosomes;
    };
}
