import { IChromosome, IIndividual } from "../genetic";
import { Event, EventBase } from "../genetic/definitions";

export function convertToWorkerEvent<
    TPhenotype,
    TIndividual extends IIndividual<unknown, unknown, IChromosome<unknown>>,
    TPhenotypeInfo,
    TIndividualInfo>(
    event: Event<unknown, unknown, TPhenotype, IChromosome<unknown>, TIndividual>,
    mapPhenotype: (value: TPhenotype) => TPhenotypeInfo,
    mapIndividual: (value: TIndividual) => TIndividualInfo): EventBase<TPhenotypeInfo, TIndividualInfo> {
    switch (event.kind) {
        case "population-initialized": return {
            kind: event.kind,
            population: event.population.map(mapIndividual),
        };
        case "generation-cycle-started": return {
            kind: event.kind,
            population: event.population.map(mapIndividual),
            generation: event.generation,
        };
        case "fitness-calculated": return {
            kind: event.kind,
            population: event.population.map(mapIndividual),
            phenotypes: event.phenotypes.map(mapPhenotype),
            generation: event.generation,
        };
        case "survivors-selected": return {
            kind: event.kind,
            population: event.population.map(mapIndividual),
            phenotypes: event.phenotypes.map(mapPhenotype),
            generation: event.generation,
        };
        case "termination-reached": return {
            kind: event.kind,
            phenotype: mapPhenotype(event.phenotype),
            winner: mapIndividual(event.winner),
            generation: event.generation,
        };
        default: throw new Error("Conversion for specified event kind is not implemented.");
    }
}
