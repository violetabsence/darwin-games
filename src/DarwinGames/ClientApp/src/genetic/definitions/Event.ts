import GeneticAlgorithm from "../GeneticAlgorithm";
import { IChromosome } from "../IChromosome";
import { IIndividual } from "../IIndividual";
import { Result } from "../Result";

export type PopulationInitializedEvent<TIndividual> =
    { kind: "population-initialized", population: TIndividual[] };
export type GenerationCycleStartedEvent<TIndividual> =
    { kind: "generation-cycle-started", population: TIndividual[], generation: number };
export type FitnessCalculatedEvent<TPhenotype, TIndividual> =
    { kind: "fitness-calculated", population: TIndividual[], phenotypes: TPhenotype[], generation: number };
export type SurvivorsSelectedEvent<TPhenotype, TIndividual> =
    { kind: "survivors-selected", population: TIndividual[], phenotypes: TPhenotype[], generation: number };
export type TerminationReachedEvent<TPhenotype, TIndividual> =
    { kind: "termination-reached", phenotype: TPhenotype, winner: TIndividual, generation: number };

export type EventBase<TPhenotype, TIndividual> =
    PopulationInitializedEvent<TIndividual> |
    GenerationCycleStartedEvent<TIndividual> |
    FitnessCalculatedEvent<TPhenotype, TIndividual> |
    SurvivorsSelectedEvent<TPhenotype, TIndividual> |
    TerminationReachedEvent<TPhenotype, TIndividual>;

export type Event<
    TGene,
    TFitness,
    TPhenotype,
    TChromosome extends IChromosome<TGene>,
    TIndividual extends IIndividual<TGene, TFitness, TChromosome>> = EventBase<TPhenotype, TIndividual>;

export type EventHandler<
    TGene,
    TFitness,
    TPhenotype,
    TGenotype,
    TChromosome extends IChromosome<TGene>,
    TIndividual extends IIndividual<TGene, TFitness, TChromosome>> =
    (this: GeneticAlgorithm<TGene, TFitness, TPhenotype, TGenotype, TChromosome, TIndividual>,
        event: Event<TGene, TFitness, TPhenotype, TChromosome, TIndividual>) => Result<void>;
