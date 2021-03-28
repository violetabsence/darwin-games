import {
    CommonSettings,
    GenerationEvent,
    processWorkerEvent,
    StopLearn,
    UpdateEvent,
    UpdateEventProgressValue,
    WorkerEventProcessor,
} from ".";
import { ILearnService } from "./ILearnService";

export abstract class LearnServiceBase<
    TSettings extends CommonSettings,
    TPhenotype,
    TIndividual,
    TGeneration,
    TSolution>
implements ILearnService<TSettings, TGeneration, TSolution> {
    protected constructor() {
        this.runLearning = this.runLearning.bind(this);
    }

    public runLearning(
        settings: TSettings,
        eventHandler: (e: UpdateEvent<TGeneration, TSolution>) => void): StopLearn {
        const processEvent = processWorkerEvent<TPhenotype, TIndividual, TGeneration, TSolution>(
            eventHandler,
            (info) => this.skipEvent(settings, info),
            (info, final) => this.mapGeneration(info, final, settings),
            (info, final) => this.mapSolutions(info, final, settings),
            (info, final) => this.mapProgress(info, final, settings));
        return this.runWorker(settings, processEvent);
    };

    protected abstract runWorker(settings: TSettings, processor: WorkerEventProcessor<TPhenotype, TIndividual>)
        : StopLearn;
    protected abstract mapGeneration(
        event: GenerationEvent<TPhenotype, TIndividual>, final: boolean, settings: TSettings): TGeneration;
    protected abstract mapSolutions(
        event: GenerationEvent<TPhenotype, TIndividual>, final: boolean, settings: TSettings): TSolution[];
    protected abstract mapProgress(
        event: GenerationEvent<TPhenotype, TIndividual>, final: boolean, settings: TSettings): UpdateEventProgressValue;

    protected skipEvent(settings: CommonSettings, event: GenerationEvent<TPhenotype, TIndividual>): boolean {
        return settings.skipGenerationCount > 0
            ? event.generation % settings.skipGenerationCount !== 0
            : false;
    }
}
