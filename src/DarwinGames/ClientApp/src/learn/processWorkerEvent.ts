import { UpdateEvent, UpdateEventProgressValue } from ".";
import { EventBase, FitnessCalculatedEvent } from "../genetic/definitions";

export type FitnessCalculatedInfo<TPhenotype, TIndividual> =
    Readonly<Omit<FitnessCalculatedEvent<TPhenotype, TIndividual>, "kind">>

export type GenerationEvent<TPhenotype, TIndividual> = FitnessCalculatedInfo<TPhenotype, TIndividual> & {
    readonly survivors: TIndividual[],
};

export type WorkerEventProcessor<TPhenotype, TIndividual> = (event: EventBase<TPhenotype, TIndividual>) => void;

export function processWorkerEvent<TPhenotype, TIndividual, TGeneration, TSolution>(
    eventHandler: (e: UpdateEvent<TGeneration, TSolution>) => void,
    skipEvent: (e: GenerationEvent<TPhenotype, TIndividual>) => boolean,
    mapGeneration: (e: GenerationEvent<TPhenotype, TIndividual>, final: boolean) => TGeneration,
    mapSolutions: (e: GenerationEvent<TPhenotype, TIndividual>, final: boolean) => TSolution[],
    mapProgress: (e: GenerationEvent<TPhenotype, TIndividual>, final: boolean) => UpdateEventProgressValue)
    : WorkerEventProcessor<TPhenotype, TIndividual> {
    let fitnessCalculatedInfo: FitnessCalculatedInfo<TPhenotype, TIndividual> | undefined;
    return (event: EventBase<TPhenotype, TIndividual>) => {
        switch (event.kind) {
            case "fitness-calculated":
                fitnessCalculatedInfo = event;
                break;
            case "survivors-selected": {
                if (fitnessCalculatedInfo?.generation !== event.generation) {
                    throw new Error("Unable to generation information.");
                }

                const info: GenerationEvent<TPhenotype, TIndividual> = {
                    ...fitnessCalculatedInfo,
                    survivors: event.population,
                };

                eventHandler({
                    kind: "progress",
                    progress: mapProgress(info, false),
                });

                if (!skipEvent(info)) {
                    eventHandler({
                        kind: "add-generation",
                        index: event.generation,
                        generation: mapGeneration(info, false),
                        solutions: mapSolutions(info, false),
                    });
                }
                break;
            }
            case "termination-reached": {
                if (fitnessCalculatedInfo?.generation !== event.generation) {
                    throw new Error("Unable to generation information.");
                }

                const info: GenerationEvent<TPhenotype, TIndividual> = {
                    ...fitnessCalculatedInfo,
                    population: [event.winner],
                    phenotypes: [event.phenotype],
                    survivors: fitnessCalculatedInfo.population,
                };

                eventHandler({
                    kind: "progress",
                    progress: mapProgress(info, true),
                });

                eventHandler({
                    kind: "set-winner",
                    index: event.generation,
                    generation: mapGeneration(info, true),
                    winner: mapSolutions(info, true)[0],
                });
                break;
            }
        }
    };
}
