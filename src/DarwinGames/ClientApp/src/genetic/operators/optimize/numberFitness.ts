import { Optimization } from "../../definitions";
import { IChromosome } from "../../IChromosome";
import { IIndividual } from "../../IIndividual";

export function minFitnessWin<
    TGene,
    TChromosome extends IChromosome<TGene>,
    TIndividual extends IIndividual<TGene, number, TChromosome>>()
    : Optimization<TGene, number, TChromosome, TIndividual> {
    return (individual, competitor) => individual.fitness - competitor.fitness;
}

export function maxFitnessWin<
    TGene,
    TChromosome extends IChromosome<TGene>,
    TIndividual extends IIndividual<TGene, number, TChromosome>>()
    : Optimization<TGene, number, TChromosome, TIndividual> {
    return (individual, competitor) => competitor.fitness - individual.fitness;
}
