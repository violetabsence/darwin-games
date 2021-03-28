import * as Comlink from "comlink";
/* eslint-disable import/no-webpack-loader-syntax */
import Worker from "worker-loader!../../../worker";

import {
    GenerationEvent,
    GenerationInfo,
    IndividualInfo,
    LearnServiceBase,
    StopLearn,
    UpdateEventProgressValue,
    WorkerEventProcessor,
} from "../../../learn";
import { LearnWorker } from "../../../worker";
import { A15PuzzleLearnSettings } from "./A15PuzzleLearnSettings";
import { PhenotypeInfo } from "./A15PuzzleLearnWorker";

export type Solution = PhenotypeInfo & IndividualInfo;

export class A15PuzzleLearnService
    extends LearnServiceBase<A15PuzzleLearnSettings, PhenotypeInfo, IndividualInfo, GenerationInfo, Solution> {
    public constructor() {
        super();
    }

    protected runWorker(
        settings: A15PuzzleLearnSettings,
        processor: WorkerEventProcessor<PhenotypeInfo, IndividualInfo>): StopLearn {
        const worker = new Worker();
        const proxy = Comlink.wrap<LearnWorker>(worker);
        proxy.a15puzzle(settings, Comlink.proxy(processor));

        return () => proxy[Comlink.releaseProxy]();
    }

    protected mapGeneration(event: GenerationEvent<PhenotypeInfo, IndividualInfo>, final: boolean)
        : GenerationInfo {
        return {
            index: event.generation,
            bestFitness: event.population[0].fitness,
            worstFitness: event.population[event.population.length - 1].fitness,
            final,
            propagation: {
                parents: event.survivors.filter((i) => i.age > 0).length,
                offsprings: event.survivors.filter((i) => i.age === 0).length,
                new: event.survivors.filter((i) => i.age < 0).length,
            },
        };
    }

    protected mapSolutions(event: GenerationEvent<PhenotypeInfo, IndividualInfo>)
        : Solution[] {
        return event.phenotypes.map((p, i) => ({
            puzzle: p.puzzle,
            moves: p.moves,
            lose: p.lose,
            age: event.population[i].age,
            fitness: event.population[i].fitness,
        }));
    }

    protected mapProgress(
        event: GenerationEvent<PhenotypeInfo, IndividualInfo>,
        final: boolean,
        settings: A15PuzzleLearnSettings) : UpdateEventProgressValue {
        return final
            ? 100
            : settings.maxGenerationCount === 0
                ? "indeterminate"
                : event.generation * 100 / settings.maxGenerationCount;
    }
}
