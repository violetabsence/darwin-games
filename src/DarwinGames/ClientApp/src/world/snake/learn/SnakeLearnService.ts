import * as Comlink from "comlink";
/* eslint-disable import/no-webpack-loader-syntax */
import Worker from "worker-loader!./worker";

import {
    GenerationEvent,
    GenerationInfo,
    IndividualInfo,
    LearnServiceBase,
    StopLearn,
    UpdateEventProgressValue,
    WorkerEventProcessor,
} from "../../../learn";
import { ILearnWorker } from "../../../learn/ILearnWorker";
import { SnakeLearnSettings } from "./SnakeLearnSettings";
import { PhenotypeInfo } from "./SnakeLearnWorker";

export type Solution = PhenotypeInfo & IndividualInfo;

export class SnakeLearnService
    extends LearnServiceBase<SnakeLearnSettings, PhenotypeInfo, IndividualInfo, GenerationInfo, Solution> {
    public constructor() {
        super();
    }

    protected runWorker(
        settings: SnakeLearnSettings,
        processor: WorkerEventProcessor<PhenotypeInfo, IndividualInfo>): StopLearn {
        const worker = new Worker();
        const proxy = Comlink.wrap<ILearnWorker<SnakeLearnSettings, PhenotypeInfo, IndividualInfo>>(worker);
        proxy.runLearning(settings, Comlink.proxy(processor));

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
            field: p.field,
            moves: p.moves,
            lose: p.lose,
            age: event.population[i].age,
            fitness: event.population[i].fitness,
        }));
    }

    protected mapProgress(
        event: GenerationEvent<PhenotypeInfo, IndividualInfo>,
        final: boolean,
        settings: SnakeLearnSettings) : UpdateEventProgressValue {
        return final
            ? 100
            : settings.maxGenerationCount === 0
                ? "indeterminate"
                : event.generation * 100 / settings.maxGenerationCount;
    }
}
