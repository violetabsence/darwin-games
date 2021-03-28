import { interval, Subscription } from "rxjs";
import { take, finalize } from "rxjs/operators";

import { A15EmptyPuzzleTile, A15PuzzleTile, I15Puzzle, I15PuzzleMatrix } from "../../game";

type Point = { x: number, y: number };
type Size = { w: number, h: number };
type Rect = Point & Size;

export class A15PuzzleRenderer2D {
    private static BoardPadding = 5;
    private static BoardColor = "#000";
    private static TilePadding = 5;
    private static TileColor = "#0f0";
    private static TileNumberFont = "Serif";
    private static AnimationFPS = 30;

    private readonly _context: CanvasRenderingContext2D;
    private readonly _puzzle: I15Puzzle;
    private _animationTimeMs: number;
    private _released: boolean;
    private _size: Size = { w: 0, h: 0 };
    private _tileSize: number = 0;
    private _tileFontSize: number = 0;
    private _boardRect: Rect = { x: 0, y: 0, w: 0, h: 0 };
    private _moveSubscription?: Subscription = undefined;

    public get animationTimeMs(): number {
        return this._animationTimeMs;
    }

    public set animationTimeMs(value: number) {
        this._animationTimeMs = value;
    }

    public constructor(context: CanvasRenderingContext2D, puzzle: I15Puzzle, animationTimeMs: number) {
        this._context = context;
        this._puzzle = puzzle;
        this._animationTimeMs = animationTimeMs;
        this._released = false;
    }

    public async render(): Promise<void> {
        if (!this._released) {
            await this.renderBoard();
        }
    }

    public renderMove(tile: A15PuzzleTile): Promise<void> {
        return this._released ? Promise.resolve() : new Promise((resolve) => {
            if (this._moveSubscription !== undefined) {
                this._moveSubscription.unsubscribe();
                this._moveSubscription = undefined;
            }

            const indexToPosition = (index: number): Point => ({
                x: Math.floor(index % this._puzzle.matrix.width),
                y: Math.floor(index / this._puzzle.matrix.width),
            });
            const positionToPoint = (position: Point): Point => ({
                x: position.x * this._tileSize,
                y: position.y * this._tileSize,
            });

            const oldTileIndex = this._puzzle.matrix.getTileIndex(tile);
            const newTileIndex = this._puzzle.matrix.getTileIndex(A15EmptyPuzzleTile);
            if (oldTileIndex === undefined || newTileIndex === undefined) {
                return;
            }

            const oldTilePosition = indexToPosition(oldTileIndex);
            const newTilePosition = indexToPosition(newTileIndex);
            const oldTilePoint = positionToPoint(oldTilePosition);
            const newTilePoint = positionToPoint(newTilePosition);
            const clearRect: Rect = {
                x: this._boardRect.x + Math.min(oldTilePoint.x, newTilePoint.x),
                y: this._boardRect.y + Math.min(oldTilePoint.y, newTilePoint.y),
                w: oldTilePoint.x !== newTilePoint.x ? this._tileSize * 2 : this._tileSize,
                h: oldTilePoint.y !== newTilePoint.y ? this._tileSize * 2 : this._tileSize,
            };

            const frameCount = Math.floor(A15PuzzleRenderer2D.AnimationFPS / (1000 / this._animationTimeMs));
            const frameDelay = this._animationTimeMs / frameCount;

            const xShift = (oldTilePoint.x - newTilePoint.x) / frameCount;
            const yShift = (oldTilePoint.y - newTilePoint.y) / frameCount;

            const matrix = this._puzzle.matrix.clone();
            this._moveSubscription = interval(frameDelay)
                .pipe(
                    take(frameCount),
                    finalize(() => {
                        this.renderBoard(matrix);
                        resolve();
                    }),
                )
                .subscribe((frame) => {
                    this._context.fillStyle = A15PuzzleRenderer2D.BoardColor;
                    this._context.fillRect(clearRect.x, clearRect.y, clearRect.w, clearRect.h);

                    const offset: Point = {
                        x: xShift * frame,
                        y: yShift * frame,
                    };

                    this.drawTile(tile, newTilePosition, offset);
                });
        });
    }

    public setSize(width: number, height: number): void {
        if (this._released) return;

        this._context.canvas.width = width;
        this._context.canvas.height = height;
        this.updateSizes();
    }

    public getTileAt(x: number, y: number): A15PuzzleTile | undefined {
        if (x < this._boardRect.x || x >= this._boardRect.x + this._boardRect.w
            || y < this._boardRect.y || y >= this._boardRect.y + this._boardRect.h) {
            return undefined;
        }

        const tileX = Math.floor((x - this._boardRect.x) / this._tileSize);
        const tileY = Math.floor((y - this._boardRect.y) / this._tileSize);
        return this._puzzle.matrix.getTileAt(tileX, tileY);
    }

    public release(): void {
        if (this._released) return;

        if (this._moveSubscription !== undefined) {
            this._moveSubscription.unsubscribe();
            this._moveSubscription = undefined;
        }

        this._released = true;
    }

    private updateSizes(): void {
        this._size = { w: this._context.canvas.width, h: this._context.canvas.height };

        // Calculate tile size.
        const gap = A15PuzzleRenderer2D.BoardPadding * 2;
        const horizontal = Math.floor((this._size.w - gap) / this._puzzle.matrix.width);
        const vertical = Math.floor((this._size.h - gap) / this._puzzle.matrix.height);
        this._tileSize = Math.min(horizontal, vertical);

        // Calculate tile number font size.
        const textWithAssumedMaxWidth = "999";
        const initialFontSize = 20;

        this._context.font = `${initialFontSize}px ${A15PuzzleRenderer2D.TileNumberFont}`;
        const initialTextMetrics = this._context.measureText(textWithAssumedMaxWidth);
        const targetTextWidth = this._tileSize - A15PuzzleRenderer2D.TilePadding * 2;
        this._tileFontSize = initialFontSize * targetTextWidth / initialTextMetrics.width;

        // Calculate board size.
        const boardSize = {
            w: this._tileSize * this._puzzle.matrix.width,
            h: this._tileSize * this._puzzle.matrix.height,
        };
        this._boardRect = {
            x: Math.floor((this._size.w - boardSize.w) / 2),
            y: Math.floor((this._size.h - boardSize.h) / 2),
            ...boardSize,
        };
    };

    private clear(rect: Rect): void {
        this._context.clearRect(rect.x, rect.y, rect.w, rect.h);
    }

    private drawBoard(): void {
        this._context.fillStyle = A15PuzzleRenderer2D.BoardColor;
        this._context.fillRect(this._boardRect.x, this._boardRect.y, this._boardRect.w, this._boardRect.h);
    }

    private drawTile(tile: A15PuzzleTile, position: Point, offset?: Point): void {
        const tileX = this._boardRect.x + (position.x * this._tileSize) + (offset?.x ?? 0);
        const tileY = this._boardRect.y + (position.y * this._tileSize) + (offset?.y ?? 0);

        this._context.strokeStyle = A15PuzzleRenderer2D.TileColor;
        this._context.strokeRect(tileX, tileY, this._tileSize, this._tileSize);

        if (tile !== A15EmptyPuzzleTile) {
            const text = "" + tile;
            const textX = Math.floor(tileX + (this._tileSize / 2));
            const textY = Math.floor(tileY + (this._tileSize / 2));

            this._context.fillStyle = A15PuzzleRenderer2D.TileColor;
            this._context.font = `${this._tileFontSize}px ${A15PuzzleRenderer2D.TileNumberFont}`;
            this._context.textAlign = "center";
            this._context.textBaseline = "middle";
            this._context.fillText(text, textX, textY, this._tileSize);
        }
    }

    private renderBoard(matrix?: I15PuzzleMatrix): Promise<void> {
        return new Promise((resolve) => {
            requestAnimationFrame(() => {
                this.clear({ x: 0, y: 0, ...this._size });
                this.drawBoard();

                if (matrix === undefined) {
                    matrix = this._puzzle.matrix;
                }

                for (let x = 0; x < matrix.width; x++) {
                    for (let y = 0; y < matrix.height; y++) {
                        const tile = matrix.getTileAt(x, y);
                        if (tile === undefined) {
                            console.error(`Failed to render tile for {${x},${y}}.`);
                            continue;
                        }

                        this.drawTile(tile, { x, y });
                    }
                }

                resolve();
            });
        });
    }
}
