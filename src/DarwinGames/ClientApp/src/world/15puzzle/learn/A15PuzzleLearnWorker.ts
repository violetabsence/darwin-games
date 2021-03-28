import { EventBase } from "../../../genetic/definitions";
import { convertToWorkerEvent, ILearnWorker, IndividualInfo } from "../../../learn";
import { A15PuzzleDirection } from "../game/A15PuzzleDirection";
import { A15PuzzleTile } from "../game/A15PuzzleTile";
import { A15PuzzleLearnSettings } from "./A15PuzzleLearnSettings";
import { Individual, learn, Phenotype } from "./learn";

export type PuzzleInfo = {
    width: number;
    height: number;
    tiles: ReadonlyArray<A15PuzzleTile>;
}

export type PhenotypeInfo = {
    puzzle: PuzzleInfo,
    moves: A15PuzzleDirection[],
    lose: boolean,
}

export const A15PuzzleLearnWorker: ILearnWorker<A15PuzzleLearnSettings, PhenotypeInfo, IndividualInfo> = {
    runLearning: (
        settings: A15PuzzleLearnSettings,
        eventHandler: (event: EventBase<PhenotypeInfo, IndividualInfo>) => void) => {
        learn(settings, (event) => {
            const serialized = convertToWorkerEvent<Phenotype, Individual, PhenotypeInfo, IndividualInfo>(
                event,
                (value) => ({
                    puzzle: {
                        width: value.initialState.width,
                        height: value.initialState.width,
                        tiles: value.initialState.tiles,
                    },
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
