import { Subject, Observable } from "rxjs";

import { A15PuzzleDirection } from "./A15PuzzleDirection";
import { A15PuzzleState } from "./A15PuzzleState";
import { A15PuzzleTile, A15EmptyPuzzleTile } from "./A15PuzzleTile";
import { I15Puzzle } from "./I15Puzzle";
import { I15PuzzleMatrix } from "./I15PuzzleMatrix";
import { I15PuzzleState } from "./I15PuzzleState";
import { validate15Puzzle } from "./validate15Puzzle";

export class A15Puzzle implements I15Puzzle {
    private readonly _state: I15PuzzleState;
    private readonly _solvedState: I15PuzzleState;
    private readonly _onMove: Subject<A15PuzzleTile> = new Subject();

    public constructor(width: number, height: number, state?: I15PuzzleState) {
        if (state !== undefined && state.width !== width && state.height !== height) {
            throw new Error("Invalid state: size doesn't match to puzzle size.");
        }

        this._state = state ?? new A15PuzzleState(width, height);
        this._solvedState = new A15PuzzleState(width, height);
    }

    public get matrix(): I15PuzzleMatrix {
        return this._state;
    }

    public get solvedState(): I15PuzzleMatrix {
        return this._solvedState;
    }

    public get validDirections(): A15PuzzleDirection[] {
        const directions = [
            A15PuzzleDirection.Top,
            A15PuzzleDirection.Right,
            A15PuzzleDirection.Bottom,
            A15PuzzleDirection.Left,
        ];

        return directions.filter((d) => this._state.getRelativeTile(A15EmptyPuzzleTile, d) !== undefined);
    }

    public get isSolvable(): boolean {
        return validate15Puzzle(this._state.tiles, this._state.width);
    }

    public get isSolved(): boolean {
        return this._state.tiles.every((v, i) => v === this._solvedState.tiles[i]);
    }

    public get onMove(): Observable<A15PuzzleTile> {
        return this._onMove;
    }

    public move(tile: A15PuzzleTile): boolean {
        const validDirections = this.validDirections;
        const fromEmpty = validDirections.find((d) => this._state.getRelativeTile(A15EmptyPuzzleTile, d) === tile);
        if (fromEmpty === undefined) return false;

        return this.moveToEmpty(fromEmpty);
    }

    public moveToEmpty(from: A15PuzzleDirection): boolean {
        const tile = this._state.moveToEmpty(from);
        if (tile === undefined) return false;

        this._onMove.next(tile);
        return true;
    }
}
