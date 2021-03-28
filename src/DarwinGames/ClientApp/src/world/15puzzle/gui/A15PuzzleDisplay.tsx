import { Grid, Typography } from "@material-ui/core";
import {
    ArrowBack,
    ArrowDownward,
    ArrowForward,
    ArrowUpward,
    CheckCircleOutline,
    Cancel,
    HelpOutline,
} from "@material-ui/icons";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { DisplayElementProps } from "../../../gui";
import { SolutionPlayer, SolutionPlayerRef } from "../../../gui/components";
import { GenerationInfo } from "../../../learn";
import { A15Puzzle, A15PuzzleDirection, A15PuzzleGenerator, A15PuzzleState } from "../game";
import { Solution } from "../learn";
import { A15PuzzleConsole, A15PuzzleDisplayRef } from "./render";

const State = (props: React.PropsWithChildren<{ text: string }>) => (
    <Grid container item direction="row" alignItems="center" justify="flex-start" spacing={1} xs={3}>
        <Grid item>
            <Typography variant="button" component="span">
                {props.text}
            </Typography>
        </Grid>
        <Grid item>
            {props.children}
        </Grid>
    </Grid>
);

const inverseDirection = (direction: A15PuzzleDirection) => {
    switch (direction) {
        default:
        case A15PuzzleDirection.Top: return A15PuzzleDirection.Bottom;
        case A15PuzzleDirection.Right: return A15PuzzleDirection.Left;
        case A15PuzzleDirection.Bottom: return A15PuzzleDirection.Top;
        case A15PuzzleDirection.Left: return A15PuzzleDirection.Right;
    }
};

const defaultFrameTimeMs = 750;
export const A15PuzzleDisplay = (props: DisplayElementProps<GenerationInfo, Solution>): JSX.Element => {
    const { selected } = props;
    const [animationTimeMs, setAnimationTimeMs] = useState(defaultFrameTimeMs);
    const [lastDirection, setLastDirection] = useState<A15PuzzleDirection>();
    const [lastDirectionColor, setLastDirectionColor] = useState<"primary" | "error">("primary");
    const displayRef = useRef<A15PuzzleDisplayRef>(null);
    const playerRef = useRef<SolutionPlayerRef>(null);

    const [puzzle, solvable, frameCount] = useMemo(() => {
        if (selected === undefined) {
            const state = A15PuzzleGenerator.randomize(4, 4);
            const puzzle = new A15Puzzle(4, 4, state);
            return [puzzle, puzzle.isSolvable, 0];
        }

        const state = new A15PuzzleState(selected.puzzle.width, selected.puzzle.height, selected.puzzle.tiles.slice());
        const puzzle = new A15Puzzle(selected.puzzle.width, selected.puzzle.height, state);
        return [puzzle, puzzle.isSolvable, selected !== undefined ? selected.moves.length + 1 : 0];
    }, [selected]);

    useEffect(() => {
        playerRef.current?.navigate(0);
        setLastDirection(undefined);
    }, [puzzle, playerRef]);

    const navigate = useCallback(async (frame: number, isLast: boolean): Promise<void> => {
        if (selected === undefined || displayRef.current === null) return;

        setLastDirection(selected.moves[frame - 1]);
        setLastDirectionColor(isLast && selected.lose ? "error" : "primary");

        const state = new A15PuzzleState(selected.puzzle.width, selected.puzzle.height, selected.puzzle.tiles.slice());
        for (let i = 0; i < frame; i++) {
            state.moveToEmpty(selected.moves[i]);
        }

        puzzle.matrix.tiles = state.tiles;
        await displayRef.current.update();
    }, [selected, puzzle, displayRef]);

    const next = useCallback(async (frame: number, isLast: boolean): Promise<void> => {
        if (selected === undefined || displayRef.current === null) return;

        const direction = selected.moves[frame];
        const isInvalid = isLast && selected.lose;
        if (!isInvalid) {
            setLastDirection(direction);
        }
        setLastDirectionColor(isInvalid ? "error" : "primary");

        if (!isInvalid) {
            await displayRef.current.move(direction);
        }
    }, [selected, displayRef]);

    const prev = useCallback(async (frame: number): Promise<void> => {
        if (selected === undefined || displayRef.current === null) return;

        const direction = inverseDirection(selected.moves[frame] as A15PuzzleDirection);
        setLastDirection(selected.moves[frame - 1]);
        setLastDirectionColor("primary");

        await displayRef.current.move(direction);
    }, [selected, displayRef]);

    const speedChange = useCallback((multiplier: number) => setAnimationTimeMs(defaultFrameTimeMs / multiplier), []);

    return (
        <Grid container direction="column">
            <Grid container item direction="row" alignItems="center" justify="center" spacing={2} xs>
                <State text="Solvable:">
                    {solvable && <CheckCircleOutline color="primary" />}
                    {!solvable && <Cancel color="error" />}
                </State>
                <State text="Solved:">
                    {puzzle.isSolved && <CheckCircleOutline color="primary" />}
                    {!puzzle.isSolved && <Cancel color="disabled" />}
                </State>
                <State text="Winner:">
                    {selected === undefined && <HelpOutline color="disabled" />}
                    {selected !== undefined && !selected.lose && <CheckCircleOutline color="primary" />}
                    {selected !== undefined && selected.lose && <Cancel color="disabled" />}
                </State>
                <State text="Move:">
                    {lastDirection === undefined && <HelpOutline color="disabled" />}
                    {lastDirection === A15PuzzleDirection.Top && <ArrowUpward color={lastDirectionColor} />}
                    {lastDirection === A15PuzzleDirection.Right && <ArrowForward color={lastDirectionColor} />}
                    {lastDirection === A15PuzzleDirection.Bottom && <ArrowDownward color={lastDirectionColor} />}
                    {lastDirection === A15PuzzleDirection.Left && <ArrowBack color={lastDirectionColor} />}
                </State>
            </Grid>
            <Grid item xs>
                {puzzle !== undefined && (
                    <A15PuzzleConsole
                        ref={displayRef}
                        style={{ width: "100%", height: "500px" }}
                        puzzle={puzzle}
                        animationTimeMs={animationTimeMs}
                        interactive={selected === undefined}
                    />
                )}
            </Grid>
            <Grid item xs>
                <SolutionPlayer
                    ref={playerRef}
                    frameCount={frameCount}
                    disabled={selected === undefined}
                    navigate={navigate}
                    next={next}
                    prev={prev}
                    speedChange={speedChange}
                />
            </Grid>
        </Grid>
    );
};
