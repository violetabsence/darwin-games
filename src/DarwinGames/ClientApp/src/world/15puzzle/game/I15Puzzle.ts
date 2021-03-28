import { Observable } from "rxjs";

import { A15PuzzleDirection } from "./A15PuzzleDirection";
import { A15PuzzleTile } from "./A15PuzzleTile";
import { I15PuzzleMatrix } from "./I15PuzzleMatrix";

export interface I15Puzzle {
    readonly matrix: I15PuzzleMatrix;
    readonly solvedState: I15PuzzleMatrix;
    readonly validDirections: A15PuzzleDirection[];
    readonly isSolvable: boolean;
    readonly isSolved: boolean;
    readonly onMove: Observable<A15PuzzleTile>;
    move(tile: A15PuzzleTile): boolean;
    moveToEmpty(from: A15PuzzleDirection): boolean;
}
