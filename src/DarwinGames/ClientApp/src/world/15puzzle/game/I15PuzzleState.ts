import { A15PuzzleDirection } from "./A15PuzzleDirection";
import { A15PuzzleTile } from "./A15PuzzleTile";
import { I15PuzzleMatrix } from "./I15PuzzleMatrix";

export interface I15PuzzleState extends I15PuzzleMatrix {
    moveToEmpty(from: A15PuzzleDirection): A15PuzzleTile | undefined;
}
