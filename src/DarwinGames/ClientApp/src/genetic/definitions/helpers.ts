import { IChromosome } from "../IChromosome";
import { IIndividual } from "../IIndividual";
import { Result } from "../Result";
import { Optimization } from "./termination";

export type SelectionHelper<
    TGene,
    TFitness,
    TChromosome extends IChromosome<TGene>,
    TIndividual extends IIndividual<TGene, TFitness, TChromosome>> = (
    count: number,
    individuals: TIndividual[],
    generation: number,
    optimize: Optimization<TGene, TFitness, TChromosome, TIndividual>) => Result<TIndividual[]>;
