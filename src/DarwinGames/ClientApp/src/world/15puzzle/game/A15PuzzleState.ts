import { A15PuzzleDirection } from "./A15PuzzleDirection";
import { A15EmptyPuzzleTile, A15PuzzleTile } from "./A15PuzzleTile";
import { I15PuzzleMatrix } from "./I15PuzzleMatrix";
import { I15PuzzleState } from "./I15PuzzleState";

export class A15PuzzleState implements I15PuzzleState {
    private readonly _width: number;
    private readonly _height: number;
    private _tiles: A15PuzzleTile[];

    public get width(): number {
        return this._width;
    }

    public get height(): number {
        return this._height;
    }

    public get tiles(): ReadonlyArray<A15PuzzleTile> {
        return Object.freeze(this._tiles.slice());
    }

    public set tiles(value: ReadonlyArray<A15PuzzleTile>) {
        if (value.length !== this._tiles.length) throw new Error("Tiles count mismatch.");
        this._tiles = value.slice();
    }

    public constructor(width: number, height: number, tiles?: A15PuzzleTile[]) {
        A15PuzzleState.validateSize(width);
        A15PuzzleState.validateSize(height);

        const count = width * height;
        const emptyIndex = count - 1;

        const validTiles = Array.from({ length: count }, (_, i) => i === emptyIndex ? A15EmptyPuzzleTile : i + 1);
        if (tiles !== undefined) {
            A15PuzzleState.validateTiles(tiles, validTiles);
        }

        this._width = width;
        this._height = height;
        this._tiles = tiles?.slice() ?? validTiles;
    }

    public clone(): I15PuzzleMatrix {
        return new A15PuzzleState(this._width, this._height, this._tiles.slice());
    }

    public getIndexPosition(index: number): {x: number, y: number } {
        return { x: index % this._width, y: Math.floor(index / this._width) };
    }

    public getTileAt(x: number, y: number): A15PuzzleTile {
        return this._tiles[y * this._width + x];
    }

    public getTileIndex(tile: A15PuzzleTile): number | undefined {
        const index = this._tiles.indexOf(tile);
        return index !== -1 ? index : undefined;
    }

    public getEmptyTileIndex(): number {
        return this._tiles.indexOf(A15EmptyPuzzleTile);
    }

    public getRelativeTile(tile: A15PuzzleTile, direction: A15PuzzleDirection): A15PuzzleTile | undefined {
        const index = this.getRelativeTileIndex(tile, direction);
        return index !== undefined ? this._tiles[index] : undefined;
    }

    public getRelativeTileIndex(tile: A15PuzzleTile, direction: A15PuzzleDirection): number | undefined {
        const tileIndex = this.getTileIndex(tile);
        if (tileIndex === undefined) return undefined;

        let relativeTileIndex: number | undefined;
        switch (direction) {
            case A15PuzzleDirection.Top:
                relativeTileIndex = tileIndex - this._width;
                break;
            case A15PuzzleDirection.Bottom:
                relativeTileIndex = tileIndex + this._width;
                break;
            case A15PuzzleDirection.Left:
            case A15PuzzleDirection.Right: {
                const xPos = tileIndex % this._width;
                relativeTileIndex = direction === A15PuzzleDirection.Left
                    ? xPos === 0 ? undefined : tileIndex - 1
                    : xPos >= this._width - 1 ? undefined : tileIndex + 1;
                break;
            }
            default: relativeTileIndex = undefined;
        }

        if (relativeTileIndex === undefined) return undefined;
        const relativeTile = this._tiles[relativeTileIndex];
        return relativeTile !== undefined ? relativeTileIndex : undefined;
    }

    public moveToEmpty(from: A15PuzzleDirection): A15PuzzleTile | undefined {
        const emptyIndex = this.getEmptyTileIndex();
        const tileIndex = this.getRelativeTileIndex(A15EmptyPuzzleTile, from);
        if (tileIndex === undefined) return undefined;

        const tile = this._tiles[tileIndex];
        this._tiles[emptyIndex] = tile;
        this._tiles[tileIndex] = A15EmptyPuzzleTile;
        return tile;
    }

    private static validateSize(size: number): void {
        if (size <= 1) throw new Error("Invalid size: cannot be less than 1.");
        if (!Number.isInteger(size)) throw new Error("Invalid size: cannot be floating point number.");
    }

    private static validateTiles(tiles: A15PuzzleTile[], validTiles: A15PuzzleTile[]) {
        if (tiles.length !== validTiles.length) throw new Error("Invalid tiles: must be of defined size.");

        const hasAllTiles = validTiles.every((t) => tiles.indexOf(t) !== -1);
        if (!hasAllTiles) throw new Error("Invalid tiles: must have 1..(size - 1) values and 1 null tile.");
    }
}
