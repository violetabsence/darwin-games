import { EventBase } from "../../../genetic/definitions";
import { convertToWorkerEvent, ILearnWorker, IndividualInfo } from "../../../learn";
import { Direction } from "../game/Direction";
import { Field } from "../game/Field";
import { Individual, learn, Phenotype } from "./learn";
import { SnakeLearnSettings } from "./SnakeLearnSettings";

export type PhenotypeInfo = {
    field: Field,
    moves: Direction[],
    lose: boolean,
}

export const SnakeLearnWorker: ILearnWorker<SnakeLearnSettings, PhenotypeInfo, IndividualInfo> = {
    runLearning: (
        settings: SnakeLearnSettings,
        eventHandler: (event: EventBase<PhenotypeInfo, IndividualInfo>) => void) => {
        learn(settings, (event) => {
            const serialized = convertToWorkerEvent<Phenotype, Individual, PhenotypeInfo, IndividualInfo>(
                event,
                (value) => ({
                    field: value.initialState,
                    moves: value.moves,
                    lose: value.lose,
                }),
                (value) => ({
                    age: value.age,
                    fitness: value.fitness,
                }),
            );

            eventHandler(serialized);
        });
    },
};
