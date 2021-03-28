import { IChromosome } from "../IChromosome";
import { IIndividual } from "../IIndividual";
import { Result } from "../Result";

export type Seed<TGene, TChromosome extends IChromosome<TGene>> = TChromosome[] | (() => Result<TChromosome[]>);

export type Initialize<
    TGene,
    TFitness,
    TChromosome extends IChromosome<TGene>,
    TIndividual extends IIndividual<TGene, TFitness, TChromosome>> =
    (chromosome: TChromosome, age: number, generation: number, parents?: TIndividual[]) => Result<TIndividual>;
