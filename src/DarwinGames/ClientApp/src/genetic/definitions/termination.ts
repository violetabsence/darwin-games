import { IChromosome } from "../IChromosome";
import { IIndividual } from "../IIndividual";
import { Result } from "../Result";

export type TerminationCriteria<
    TGene,
    TFitness,
    TChromosome extends IChromosome<TGene>,
    TIndividual extends IIndividual<TGene, TFitness, TChromosome>> =
    (individuals: TIndividual[], generation: number) => Result<boolean>;

export type Optimization<
    TGene,
    TFitness,
    TChromosome extends IChromosome<TGene>,
    TIndividual extends IIndividual<TGene, TFitness, TChromosome>> =
    (individual: TIndividual, competitor: TIndividual) => number;
