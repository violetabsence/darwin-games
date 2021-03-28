import { I15PuzzleState } from "./I15PuzzleState";

export interface I15PuzzleGenerator {
    randomize15Puzzle(width: number, height: number): I15PuzzleState;
}
