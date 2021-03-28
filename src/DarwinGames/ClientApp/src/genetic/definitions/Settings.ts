import { IChromosome } from "../IChromosome";
import { IIndividual } from "../IIndividual";
import { Crossover, Mating, Mutation, Selection } from "./evolution";
import { Decode, Encode, Fitness, Problem, Solution } from "./fitness";
import { Initialize } from "./initialization";
import { Optimization, TerminationCriteria } from "./termination";

export type Settings<
    TGene,
    TFitness,
    TPhenotype,
    TGenotype,
    TChromosome extends IChromosome<TGene> = IChromosome<TGene>,
    TIndividual extends IIndividual<TGene, TFitness, TChromosome> = IIndividual<TGene, TFitness, TChromosome>> = {
    individual: Initialize<TGene, TFitness, TChromosome, TIndividual>,
    problem: Problem<TPhenotype>,
    encode: Encode<TPhenotype, TGenotype>,
    solution: Solution<TGene, TGenotype, TChromosome>,
    decode: Decode<TGenotype, TPhenotype>,
    fitness: Fitness<TPhenotype, TFitness>,
    mating: Mating<TGene, TFitness, TChromosome, TIndividual>,
    crossover: Crossover<TGene, TFitness, TChromosome, TIndividual>,
    mutation: Mutation<TGene, TChromosome>,
    selection: Selection<TGene, TFitness, TChromosome, TIndividual>,
    termination: TerminationCriteria<TGene, TFitness, TChromosome, TIndividual>,
    optimization: Optimization<TGene, TFitness, TChromosome, TIndividual>,
};

export type FlatSettings<
    TGene,
    TFitness,
    TGenotype,
    TChromosome extends IChromosome<TGene> = IChromosome<TGene>,
    TIndividual extends IIndividual<TGene, TFitness, TChromosome> = IIndividual<TGene, TFitness, TChromosome>> =
    Omit<Omit<Settings<TGene, TFitness, TGenotype, TGenotype, TChromosome, TIndividual>, "encode">, "decode">;

export type SimpleSettings<
    TGene,
    TFitness,
    TChromosome extends IChromosome<TGene> = IChromosome<TGene>,
    TIndividual extends IIndividual<TGene, TFitness, TChromosome> = IIndividual<TGene, TFitness, TChromosome>> =
    Omit<Omit<FlatSettings<TGene, TFitness, TChromosome, TChromosome, TIndividual>, "problem">, "solution">;
