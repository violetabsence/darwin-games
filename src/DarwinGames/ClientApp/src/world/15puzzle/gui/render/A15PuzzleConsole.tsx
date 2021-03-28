import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

import { A15PuzzleDirection, I15Puzzle } from "../../game";
import { A15PuzzleRenderer2D } from "./A15PuzzleRenderer2D";

type A15PuzzleDisplayRefType = React.ForwardedRef<A15PuzzleDisplayRef>;
export interface A15PuzzleDisplayRef extends HTMLCanvasElement {
    update: () => Promise<void>;
    move: (direction: A15PuzzleDirection) => Promise<void>;
}

export interface A15PuzzleConsoleProps
    extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement> {
    puzzle: I15Puzzle;
    animationTimeMs?: number;
    interactive?: boolean;
}

const defaultAnimationTimeMs = 500;
export const A15PuzzleConsole = forwardRef((props: A15PuzzleConsoleProps, ref: A15PuzzleDisplayRefType) => {
    const { puzzle, animationTimeMs, interactive, onClick, ...restProps } = props;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [renderer, setRenderer] = useState<A15PuzzleRenderer2D>();

    useImperativeHandle(ref, () => ({
        update: () => renderer?.render() ?? Promise.resolve(),
        move: async (direction: A15PuzzleDirection) => {
            const tile = puzzle.matrix.getRelativeTile("empty", direction);
            if (tile === undefined) return;

            puzzle.moveToEmpty(direction);
            await renderer?.renderMove(tile);
        },
        ...(canvasRef.current! ?? {}),
    }), [puzzle, canvasRef, renderer]);

    useEffect(() => {
        if (canvasRef.current === null) {
            setRenderer(undefined);
            return;
        }

        const context = canvasRef.current.getContext("2d");
        if (context === null) {
            console.error("Puzzle display: unable to get 2D rendering context.");
            return;
        }

        const renderer = new A15PuzzleRenderer2D(context, puzzle, animationTimeMs ?? defaultAnimationTimeMs);
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
    }, [canvasRef, puzzle, animationTimeMs]);

    const innerOnClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (interactive === true) {
            const x = e.clientX - e.currentTarget.offsetLeft;
            const y = e.clientY - e.currentTarget.offsetTop;
            const tile = renderer?.getTileAt(x, y);
            if (tile !== undefined && props.puzzle.move(tile)) {
                renderer?.renderMove(tile);
            }
        }

        if (onClick !== undefined) {
            onClick(e);
        }
    }, [props.puzzle, renderer, interactive, onClick]);

    return <canvas ref={canvasRef} onClick={innerOnClick} {...restProps} />;
});
