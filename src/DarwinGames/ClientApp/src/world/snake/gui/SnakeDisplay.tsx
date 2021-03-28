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
import { Direction, SnakeGame } from "../game";
import { Solution } from "../learn";
import { SnakeConsole, SnakeDisplayRef } from "./render";

const State = (props: React.PropsWithChildren<{ text: string }>) => (
    <Grid container item direction="row" alignItems="center" justify="flex-start" spacing={1} xs={4}>
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

const defaultFrameTimeMs = 750;
export const SnakeDisplay = (props: DisplayElementProps<GenerationInfo, Solution>): JSX.Element => {
    const { selected } = props;
    const [animationTimeMs, setAnimationTimeMs] = useState(defaultFrameTimeMs);
    const [lastDirection, setLastDirection] = useState<Direction>();
    const [lastDirectionColor, setLastDirectionColor] = useState<"primary" | "error">("primary");
    const displayRef = useRef<SnakeDisplayRef>(null);
    const playerRef = useRef<SolutionPlayerRef>(null);

    const [game, frameCount] = useMemo(() => {
        if (selected === undefined) {
            const game = new SnakeGame({ mode: "new", size: { w: SnakeGame.MinSize, h: SnakeGame.MinSize } });
            return [game, 0];
        }

        const game = new SnakeGame({ mode: "load", field: { ...selected.field } });
        return [game, selected !== undefined ? selected.moves.length + 1 : 0];
    }, [selected]);

    useEffect(() => {
        playerRef.current?.navigate(0);
        setLastDirection(undefined);
    }, [game, playerRef]);

    const navigate = useCallback(async (frame: number, isLast: boolean, prev?: boolean): Promise<void> => {
        if (selected === undefined || displayRef.current === null) return;

        setLastDirection(selected.moves[frame - 1]);
        setLastDirectionColor(isLast && selected.lose ? "error" : "primary");

        const state = new SnakeGame({ mode: "load", field: { ...selected.field } });
        for (let i = 0; i < frame; i++) {
            state.setDirection(selected.moves[i]);
            state.move();
        }

        game.loadFrom(state);
        await displayRef.current.update(prev);
    }, [selected, game, displayRef]);

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

    const prev = useCallback(async (frame: number): Promise<void> => navigate(frame, false, true), [navigate]);

    const speedChange = useCallback((multiplier: number) => setAnimationTimeMs(defaultFrameTimeMs / multiplier), []);

    return (
        <Grid container direction="column">
            <Grid container item direction="row" alignItems="center" justify="center" spacing={2} xs>
                <State text="Solved:">
                    {game.state === "win" && <CheckCircleOutline color="primary" />}
                    {game.state === "lose" && <Cancel color="error" />}
                    {game.state === "play" && <HelpOutline color="disabled" />}
                </State>
                <State text="Winner:">
                    {selected === undefined && <HelpOutline color="disabled" />}
                    {selected !== undefined && !selected.lose && <CheckCircleOutline color="primary" />}
                    {selected !== undefined && selected.lose && <Cancel color="disabled" />}
                </State>
                <State text="Move:">
                    {lastDirection === undefined && <HelpOutline color="disabled" />}
                    {lastDirection === Direction.Top && <ArrowUpward color={lastDirectionColor} />}
                    {lastDirection === Direction.Right && <ArrowForward color={lastDirectionColor} />}
                    {lastDirection === Direction.Bottom && <ArrowDownward color={lastDirectionColor} />}
                    {lastDirection === Direction.Left && <ArrowBack color={lastDirectionColor} />}
                </State>
            </Grid>
            <Grid item xs>
                {game !== undefined && (
                    <SnakeConsole
                        ref={displayRef}
                        style={{ width: "100%", height: "500px" }}
                        game={game}
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
