import { A15PuzzleDirection } from "./A15PuzzleDirection";
import { A15PuzzleTile } from "./A15PuzzleTile";

export interface I15PuzzleMatrix {
    readonly width: number;
    readonly height: number;
    tiles: ReadonlyArray<A15PuzzleTile>;
    clone(): I15PuzzleMatrix;
    getIndexPosition(index: number): {x: number, y: number };
    getTileAt(x: number, y: number): A15PuzzleTile | undefined;
    getTileIndex(tile: A15PuzzleTile): number | undefined;
    getEmptyTileIndex(): number;
    getRelativeTile(tile: A15PuzzleTile, direction: A15PuzzleDirection): A15PuzzleTile | undefined;
    getRelativeTileIndex(tile: A15PuzzleTile, direction: A15PuzzleDirection): number | undefined;
}
