import { shuffleArray } from "../../../utils";
import { A15PuzzleState } from "./A15PuzzleState";
import { A15EmptyPuzzleTile } from "./A15PuzzleTile";
import { I15PuzzleGenerator } from "./I15PuzzleGenerator";
import { I15PuzzleState } from "./I15PuzzleState";
import { validate15Puzzle } from "./validate15Puzzle";

export class A15PuzzleGenerator implements I15PuzzleGenerator {
    private static readonly instance: A15PuzzleGenerator = new A15PuzzleGenerator();

    public static randomize(width: number, height: number): I15PuzzleState {
        return A15PuzzleGenerator.instance.randomize15Puzzle(width, height);
    }

    public randomize15Puzzle(width: number, height: number): I15PuzzleState {
        const count = width * height;
        const emptyIndex = count - 1;
        const tiles = Array.from({ length: count }, (_, i) => i !== emptyIndex ? i + 1 : A15EmptyPuzzleTile);

        do {
            shuffleArray(tiles);
        } while (validate15Puzzle(tiles, width) !== true);

        return new A15PuzzleState(width, height, tiles);
    }
}
