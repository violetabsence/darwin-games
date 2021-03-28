import { Learn } from ".";

export interface ILearnService<TSettings, TGeneration, TSolution> {
    readonly runLearning: Learn<TSettings, TGeneration, TSolution>;
}
