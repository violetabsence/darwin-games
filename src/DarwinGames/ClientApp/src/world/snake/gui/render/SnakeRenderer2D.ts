import { Direction, Point, Size } from "../../game";
import { ISnakeGame } from "../../game/ISnakeGame";
import { ObjectType } from "../../game/ObjectType";

type Rect = Point & Size;

export class SnakeRenderer2D {
    private static BoardPadding = 5;
    private static LineColor = "#333";
    private static FieldColor = "#fff";
    private static HeadColor = "#090";
    private static SnakeColor = "#060";
    private static DeadHeadColor = "#360";
    private static DeadSnakeColor = "#330";
    private static FoodColor = "#900";

    private readonly _context: CanvasRenderingContext2D;
    private readonly _game: ISnakeGame;
    private _animationTimeMs: number;
    private _released: boolean;
    private _size: Size = { w: 0, h: 0 };
    private _tileSize: number = 0;
    private _eyeSize: number = 0;
    private _fieldRect: Rect = { x: 0, y: 0, w: 0, h: 0 };

    public get animationTimeMs(): number {
        return this._animationTimeMs;
    }

    public set animationTimeMs(value: number) {
        this._animationTimeMs = value;
    }

    public constructor(context: CanvasRenderingContext2D, game: ISnakeGame, animationTimeMs: number) {
        this._context = context;
        this._game = game;
        this._animationTimeMs = animationTimeMs;
        this._released = false;
    }

    public render(): Promise<void> {
        if (this._released) return Promise.resolve();

        return new Promise((resolve) => {
            requestAnimationFrame(() => {
                this.clear({ x: 0, y: 0, ...this._size });

                for (let x = 0; x < this._game.field.size.w; x++) {
                    for (let y = 0; y < this._game.field.size.h; y++) {
                        const point = { x, y };
                        const obj = this._game.getObject(point);
                        this.drawObject(obj, point);
                    }
                }

                resolve();
            });
        });
    }

    public setSize(width: number, height: number): void {
        if (this._released) return;

        this._context.canvas.width = width;
        this._context.canvas.height = height;
        this.updateSizes();
    }

    public release(): void {
        this._released = true;
    }

    private updateSizes(): void {
        this._size = { w: this._context.canvas.width, h: this._context.canvas.height };

        // Calculate tile size.
        const gap = SnakeRenderer2D.BoardPadding * 2;
        const horizontal = Math.floor((this._size.w - gap) / this._game.field.size.w);
        const vertical = Math.floor((this._size.h - gap) / this._game.field.size.h);
        this._tileSize = Math.min(horizontal, vertical);
        this._eyeSize = this._tileSize / 5;

        // Calculate field size.
        const fieldSize = {
            w: this._tileSize * this._game.field.size.w,
            h: this._tileSize * this._game.field.size.h,
        };
        this._fieldRect = {
            x: Math.floor((this._size.w - fieldSize.w) / 2),
            y: Math.floor((this._size.h - fieldSize.h) / 2),
            ...fieldSize,
        };
    };

    private clear(rect: Rect): void {
        this._context.clearRect(rect.x, rect.y, rect.w, rect.h);
    }

    private drawObject(type: ObjectType, position: Point): void {
        const tileX = this._fieldRect.x + position.x * this._tileSize;
        const tileY = this._fieldRect.y + position.y * this._tileSize;

        this._context.strokeStyle = SnakeRenderer2D.LineColor;
        this._context.fillStyle = this.getColor(type);
        this._context.fillRect(tileX, tileY, this._tileSize, this._tileSize);
        this._context.strokeRect(tileX, tileY, this._tileSize, this._tileSize);

        if (type === "head") {
            this._context.fillStyle = this.getColor("eye");
            this.getEyePoints(tileX, tileY)
                .forEach((p) => this._context.fillRect(p.x, p.y, this._eyeSize, this._eyeSize));
        }
    }

    private getColor(type: ObjectType | "eye"): string {
        switch (type) {
            default:
            case "none": return SnakeRenderer2D.FieldColor;
            case "head": return this._game.snake.alive ? SnakeRenderer2D.HeadColor : SnakeRenderer2D.DeadHeadColor;
            case "eye":
            case "snake": return this._game.snake.alive ? SnakeRenderer2D.SnakeColor : SnakeRenderer2D.DeadSnakeColor;
            case "food": return SnakeRenderer2D.FoodColor;
        }
    }

    private getEyePoints(tileX: number, tileY: number): [Point, Point] {
        switch (this._game.snake.direction) {
            case Direction.Top: return [
                { x: tileX + this._eyeSize, y: tileY },
                { x: tileX + this._eyeSize * 3, y: tileY },
            ];
            case Direction.Right: return [
                { x: tileX + this._eyeSize * 4, y: tileY + this._eyeSize },
                { x: tileX + this._eyeSize * 4, y: tileY + this._eyeSize * 3 },
            ];
            case Direction.Bottom: return [
                { x: tileX + this._eyeSize, y: tileY + this._eyeSize * 4 },
                { x: tileX + this._eyeSize * 3, y: tileY + this._eyeSize * 4 },
            ];
            case Direction.Left: return [
                { x: tileX, y: tileY + this._eyeSize },
                { x: tileX, y: tileY + this._eyeSize * 3 },
            ];
        }
    }
}
