import { Initialize } from "../../definitions";
import { IChromosome } from "../../IChromosome";
import { IIndividual } from "../../IIndividual";

export function individual<
    TGene,
    TFitness,
    TChromosome extends IChromosome<TGene>,
    TIndividual extends IIndividual<TGene, TFitness, TChromosome>>(fitness: TFitness)
    : Initialize<TGene, TFitness, TChromosome, TIndividual> {
    return (chromosome, age) => ({ chromosome, age, fitness } as TIndividual);
}
