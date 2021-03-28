import * as Comlink from "comlink";

import { A15PuzzleLearnWorker } from "../world/15puzzle/learn/A15PuzzleLearnWorker";
import { SnakeLearnWorker } from "../world/snake/learn/SnakeLearnWorker";

export type LearnWorker = {
    a15puzzle: typeof A15PuzzleLearnWorker.runLearning,
    snake: typeof SnakeLearnWorker.runLearning,
}

const worker: LearnWorker = {
    a15puzzle: A15PuzzleLearnWorker.runLearning,
    snake: SnakeLearnWorker.runLearning,
};

Comlink.expose(worker);
