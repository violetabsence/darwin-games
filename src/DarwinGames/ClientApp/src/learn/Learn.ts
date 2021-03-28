import { UpdateEvent } from ".";

export type StopLearn = () => void;
export type Learn<TSettings, TGeneration, TSolution> =
    (settings: TSettings, eventHandler: (event: UpdateEvent<TGeneration, TSolution>) => void) => StopLearn;
