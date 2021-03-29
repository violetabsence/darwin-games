import { getRandomInt } from "../../../utils";
import { Direction } from "./Direction";
import { Field } from "./Field";
import { ISnakeGame } from "./ISnakeGame";
import { ObjectType } from "./ObjectType";
import { Point } from "./Point";
import { Size } from "./Size";
import { Snake } from "./Snake";
import { SnakeGameState } from "./SnakeGameState";

export class SnakeGame implements ISnakeGame {
    public static readonly MinSize: number = 10;
    public static readonly SnakeInitialLength: number = 3;

    private _snake: Snake;
    private _field: Field;
    private _state: SnakeGameState;
    private _nextDirection?: Direction;

    public get snake(): Snake {
        return { ...this._snake };
    }

    public get field(): Field {
        return { ...this._field };
    }

    public get state(): SnakeGameState {
        return this._state;
    }

    public constructor(data: { mode: "new", size: Size} | { mode: "load", field: Field }) {
        const size = { ...(data.mode === "new" ? data.size : data.field.size) };
        if (size.w < SnakeGame.MinSize || size.h < SnakeGame.MinSize) {
            throw new Error(`Unable to create Snake Game: size cannot be less than '${SnakeGame.MinSize}'.`);
        }

        this._snake = this.initSnake(size.h);
        this._field = data.mode === "new" ? this.initField(size, this._snake) : data.field;
        this._state = "play";
    }

    public setDirection(direction: Direction): void {
        if (!this.isOpposite(direction)) {
            this._nextDirection = direction;
        }
    }

    public move(): ObjectType {
        if (this._state !== "play") return "void";

        if (this._nextDirection !== undefined) {
            this._snake.direction = this._nextDirection;
            this._nextDirection = undefined;
        }

        const next = this.getRelativePoint(this._snake, this._snake.direction);
        const obj = this.getObject(next);
        if (obj === "void" || obj === "snake") {
            this.setState("lose");
            return obj;
        }

        const newSegment = obj === "food" ? this._snake.segments[this._snake.segments.length - 1] : undefined;

        let shift = { x: this._snake.x, y: this._snake.y };
        this._snake.x = next.x;
        this._snake.y = next.y;
        for (let i = 0; i < this._snake.segments.length; i++) {
            const point = { ...this._snake.segments[i] };
            this._snake.segments[i] = shift;
            shift = point;
        }

        if (newSegment !== undefined) {
            this._snake.segments.push(newSegment);
            this._field.food = this.placeFood();
        }

        if (this._snake.segments.length === this._field.size.w * this._field.size.h) {
            this.setState("win");
        }

        return obj;
    }

    public reset(): void {
        this._snake = this.initSnake(this._field.size.h);
        this._field = this.initField(this._field.size, this._snake);
        this._state = "play";
    }

    public getObject(point: Point, size?: Size): ObjectType {
        if (!this.isInsideField(point, size)) {
            return "void";
        }

        if (this.comparePoint(point, this._snake)) {
            return "head";
        }

        const hasSnake = this._snake.segments.findIndex((s) => this.comparePoint(point, s)) !== -1;
        return hasSnake
            ? "snake"
            : this._field !== undefined && this.comparePoint(point, this._field.food) ? "food" : "none";
    }

    public loadFrom(game: ISnakeGame): void {
        this._field = { ...game.field };
        this._snake = { ...game.snake };
        this._state = game.state;
    }

    private initSnake(fieldHeight: number): Snake {
        const x = 1 + SnakeGame.SnakeInitialLength;
        const y = Math.floor(fieldHeight / 2);
        const segments = new Array(SnakeGame.SnakeInitialLength - 1)
            .fill(undefined)
            .map((_, i) => ({ x: x - 1 - i, y }));
        return { x, y, segments, alive: true, direction: Direction.Right };
    }

    private initField(size: Size, snake: Snake): Field {
        return { size, food: this.placeFood(size, snake) };
    }

    private placeFood(size?: Size, snake?: Snake): Point {
        size = size ?? this._field.size;
        snake = snake ?? this._snake;

        const available = new Array(size.w * size.h)
            .fill(undefined)
            .map((_, i) => this.toPoint(i, size))
            .filter((p) => this.getObject(p, size) === "none");

        const index = getRandomInt(0, available.length - 1);
        return available[index];
    }

    private toPoint(index: number, size?: Size): Point {
        size = size ?? this._field.size;
        return { x: index % size.w, y: Math.floor(index / size.h) };
    }

    private comparePoint(a: Point, b: Point): boolean {
        return a.x === b.x && a.y === b.y;
    }

    private isInsideField(point: Point, size?: Size): boolean {
        size = size ?? this._field.size;
        return point.x >= 0 && point.x < size.w
            && point.y >= 0 && point.y < size.h;
    }

    private getRelativePoint(point: Point, direction: Direction): Point {
        switch (direction) {
            case Direction.Top: return { x: point.x, y: point.y - 1 };
            case Direction.Right: return { x: point.x + 1, y: point.y };
            case Direction.Bottom: return { x: point.x, y: point.y + 1 };
            case Direction.Left: return { x: point.x - 1, y: point.y };
        }
    }

    private isOpposite(direction: Direction): boolean {
        switch (direction) {
            case Direction.Top: return this._snake.direction === Direction.Bottom;
            case Direction.Right: return this._snake.direction === Direction.Left;
            case Direction.Bottom: return this._snake.direction === Direction.Top;
            case Direction.Left: return this._snake.direction === Direction.Right;
        }
    }

    private setState(state: SnakeGameState) {
        this._snake.alive = state !== "lose";
        this._state = state;
    }
}
