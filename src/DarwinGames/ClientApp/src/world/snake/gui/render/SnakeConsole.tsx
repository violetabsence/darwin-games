import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

import { delay } from "../../../../utils";
import { Direction, ISnakeGame } from "../../game";
import { SnakeRenderer2D } from "./SnakeRenderer2D";

type SnakeDisplayRefType = React.ForwardedRef<SnakeDisplayRef>;
export interface SnakeDisplayRef {
    update: (prev?: boolean) => Promise<void>;
    move: (direction: Direction) => Promise<void>;
}

export interface SnakeConsoleProps
    extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement> {
    game: ISnakeGame;
    animationTimeMs?: number;
    interactive?: boolean;
}

const defaultAnimationTimeMs = 500;
export const SnakeConsole = forwardRef((props: SnakeConsoleProps, ref: SnakeDisplayRefType) => {
    const { game, animationTimeMs, interactive, tabIndex, onKeyDown, ...restProps } = props;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [renderer, setRenderer] = useState<SnakeRenderer2D>();
    const [play, setPlay] = useState(false);

    useImperativeHandle(ref, () => ({
        update: async (prev?: boolean) => {
            await renderer?.render();
            if (prev === true) {
                await delay(animationTimeMs ?? defaultAnimationTimeMs);
            }
        },
        move: async (direction: Direction) => {
            game.setDirection(direction);
            game.move();
            await renderer?.render();
            await delay(animationTimeMs ?? defaultAnimationTimeMs);
        },
        ...(canvasRef.current! ?? {}),
    }), [game, animationTimeMs, canvasRef, renderer]);

    useEffect(() => {
        setPlay(false);

        if (canvasRef.current === null) {
            setRenderer(undefined);
            return;
        }

        const context = canvasRef.current.getContext("2d");
        if (context === null) {
            console.error("Snake display: unable to get 2D rendering context.");
            return;
        }

        const renderer = new SnakeRenderer2D(context, game, animationTimeMs ?? defaultAnimationTimeMs);
        setRenderer(renderer);

        const resize = () => {
            renderer.setSize(context.canvas.clientWidth, context.canvas.clientHeight);
            renderer.render();
        };
        resize();

        window.addEventListener("resize", resize);
        return () => {
            renderer.release();
            window.removeEventListener("resize", resize);
        };
    }, [canvasRef, game, animationTimeMs]);

    useEffect(() => {
        if (play === false) return undefined;

        let interval : NodeJS.Timeout | undefined = setInterval(() => {
            if (game.state !== "play" && interval !== undefined) {
                clearInterval(interval);
                interval = undefined;
                setPlay(false);
                return;
            }

            game.move();
            renderer?.render();
        }, Math.floor(defaultAnimationTimeMs / 4));

        return () => {
            if (interval !== undefined) {
                clearInterval(interval);
            }
        };
    }, [play, game, renderer]);

    const innerOnKeyDown = useCallback((e: React.KeyboardEvent<HTMLCanvasElement>) => {
        if (interactive === true) {
            setPlay(true);
            if (game.state !== "play") {
                game.reset();
                renderer?.render();
            } else {
                switch (e.key) {
                    case "ArrowUp":
                        game.setDirection(Direction.Top);
                        break;
                    case "ArrowRight":
                        game.setDirection(Direction.Right);
                        break;
                    case "ArrowDown":
                        game.setDirection(Direction.Bottom);
                        break;
                    case "ArrowLeft":
                        game.setDirection(Direction.Left);
                        break;
                }
            }
        }

        if (onKeyDown !== undefined) {
            onKeyDown(e);
        }
    }, [game, renderer, interactive, onKeyDown]);

    return <canvas ref={canvasRef} onKeyDown={innerOnKeyDown} tabIndex={interactive ? 0 : tabIndex} {...restProps} />;
});
