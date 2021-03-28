import { TerminationCriteria } from "../../definitions";
import { IChromosome } from "../../IChromosome";
import { IIndividual } from "../../IIndividual";

export function simpleTerminationCriteria<
    TGene,
    TFitness,
    TChromosome extends IChromosome<TGene>,
    TIndividual extends IIndividual<TGene, TFitness, TChromosome>>(
    maxGeneration: number,
    validFitness: (fitness: TFitness) => boolean): TerminationCriteria<TGene, TFitness, TChromosome, TIndividual> {
    return (individuals, generation) =>
        (maxGeneration > 0 && generation >= maxGeneration) || individuals.some((i) => validFitness(i.fitness));
}
