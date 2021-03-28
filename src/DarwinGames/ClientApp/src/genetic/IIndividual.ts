import { IChromosome } from "./IChromosome";

export interface IIndividual<TGene, TFitness, TChromosome extends IChromosome<TGene>> {
    readonly chromosome: TChromosome;
    fitness: TFitness;
    age: number;
}
