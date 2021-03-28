import { IChromosome } from "../IChromosome";
import { Result } from "../Result";

export type Problem<TPhenotype> = (generation: number) => Result<TPhenotype>;

export type Encode<TPhenotype, TGenotype> = (phenotype: TPhenotype) => Result<TGenotype>;

export type Solution<TGene, TGenotype, TChromosome extends IChromosome<TGene>> =
    (chromosome: TChromosome, genotype: TGenotype) => Result<TGenotype>;

export type Decode<TGenotype, TPhenotype> = (genotype: TGenotype) => Result<TPhenotype>;

export type Fitness<TPhenotype, TFitness> = (phenotype: TPhenotype) => Result<TFitness>;
