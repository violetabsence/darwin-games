import { IChromosome } from "../IChromosome";
import { IIndividual } from "../IIndividual";
import { Result } from "../Result";
import { Optimization } from "./termination";

export type Mating<
    TGene,
    TFitness,
    TChromosome extends IChromosome<TGene>,
    TIndividual extends IIndividual<TGene, TFitness, TChromosome>> =
    (individuals: TIndividual[], generation: number, optimize: Optimization<TGene, TFitness, TChromosome, TIndividual>)
        => Result<TIndividual[][]>;

export type Crossover<
    TGene,
    TFitness,
    TChromosome extends IChromosome<TGene>,
    TIndividual extends IIndividual<TGene, TFitness, TChromosome>> =
    (individuals: TIndividual[], generation: number, optimize: Optimization<TGene, TFitness, TChromosome, TIndividual>)
        => Result<TChromosome[]>;

export type Mutation<TGene, TChromosome extends IChromosome<TGene>> =
    (chromosome: TChromosome, generation: number) => Result<void>;

export type Selection<
    TGene,
    TFitness,
    TChromosome extends IChromosome<TGene>,
    TIndividual extends IIndividual<TGene, TFitness, TChromosome>> =
    (individuals: TIndividual[], generation: number, optimize: Optimization<TGene, TFitness, TChromosome, TIndividual>)
        => Result<TIndividual[]>;
