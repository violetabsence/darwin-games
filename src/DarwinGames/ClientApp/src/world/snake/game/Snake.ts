import { Direction } from "./Direction";
import { Point } from "./Point";

export type Snake = Point & {
    readonly segments: Point[];
    alive: boolean;
    direction: Direction;
}
