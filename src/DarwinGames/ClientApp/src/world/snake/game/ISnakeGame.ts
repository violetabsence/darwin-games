import { Direction } from "./Direction";
import { Field } from "./Field";
import { ObjectType } from "./ObjectType";
import { Point } from "./Point";
import { Snake } from "./Snake";
import { SnakeGameState } from "./SnakeGameState";

export interface ISnakeGame {
    readonly snake: Readonly<Snake>;
    readonly field: Readonly<Field>;
    readonly state: SnakeGameState;
    setDirection: (direction: Direction) => void;
    move: () => void;
    reset: () => void;
    getObject: (point: Point) => ObjectType;
    loadFrom: (game: ISnakeGame) => void;
}
