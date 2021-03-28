import { EventBase } from "../genetic/definitions";

export type RunLearningDelegate<TSettings, TPhenotype, TIndividual> =
    (settings: TSettings, eventHandler: (event: EventBase<TPhenotype, TIndividual>) => void) => void;

export interface ILearnWorker<TSettings, TPhenotype, TIndividual> {
    readonly runLearning: RunLearningDelegate<TSettings, TPhenotype, TIndividual>;
}
