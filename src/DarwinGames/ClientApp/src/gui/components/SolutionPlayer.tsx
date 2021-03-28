import { Badge, Box, BoxProps, Button, Grid, Slider } from "@material-ui/core";
import {
    ArrowBack,
    ArrowForward,
    FastForwardSharp,
    PauseSharp,
    PlayArrow,
    SkipNext,
    SkipPrevious,
} from "@material-ui/icons";
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { defer, of } from "rxjs";
import { switchMap } from "rxjs/operators";

type SolutionPlayerRefType = React.ForwardedRef<SolutionPlayerRef>;
export interface SolutionPlayerRef {
    play: boolean;
    speed: number;
    frame: number;
    lastFrame: number;
    togglePlay: () => void;
    navigate: (frame: number) => void;
    next: () => void;
    prev: () => void;
    toBegin: () => void;
    toEnd: () => void;
    nextSpeed: () => void;
}

export type SolutionPlayerProps = BoxProps & {
    frameCount: number,
    disabled?: boolean;
    navigate: (frame: number, isLast: boolean) => Promise<void>,
    next: (frame: number, isLast: boolean) => Promise<void>,
    prev: (frame: number) => Promise<void>,
    speedChange: (multiplier: number) => void,
};

export const SolutionPlayer = forwardRef((props: SolutionPlayerProps, ref: SolutionPlayerRefType): JSX.Element => {
    const { frameCount, disabled, navigate, next, prev, speedChange, ...boxProps } = props;
    const [frame, setFrame] = useState(0);
    const [play, setPlay] = useState(false);
    const [speed, setSpeed] = useState(1);

    const lastFrame = Math.max(0, frameCount - 1);

    const goTo = useCallback(async (type: "navigate" | "next" | "prev", toFrame?: number): Promise<void> => {
        switch (type) {
            case "navigate":
                if (toFrame === undefined || toFrame < 0 || toFrame > lastFrame || toFrame === frame) return;

                await navigate(toFrame, toFrame === lastFrame);
                setFrame(toFrame);
                break;
            case "next":
                if (frame >= lastFrame) return;

                const nextFrame = frame + 1;
                await next(nextFrame, nextFrame === lastFrame);
                setFrame(nextFrame);
                break;
            case "prev":
                if (frame <= 0) return;

                const prevFrame = frame - 1;
                await prev(prevFrame);
                setFrame(prevFrame);
                break;
        };
    }, [frame, lastFrame, navigate, next, prev]);

    useEffect(() => {
        if (play === false) return undefined;

        const subscription = of(null)
            .pipe(switchMap(() => defer(() => goTo("next"))))
            .subscribe();

        return () => subscription.unsubscribe();
    }, [play, goTo]);

    useEffect(() => {
        if (play && frame === lastFrame) {
            setPlay(false);
        }
    }, [play, frame, lastFrame]);

    const togglePlay = useCallback(() => {
        if (play === false && frame === lastFrame) {
            setFrame(0);
            goTo("navigate", 0);
        }

        setPlay((p) => !p);
    }, [play, frame, lastFrame, goTo]);
    const toNext = useCallback(() => goTo("next"), [goTo]);
    const toPrev = useCallback(() => goTo("prev"), [goTo]);
    const toBegin = useCallback(() => goTo("navigate", 0), [goTo]);
    const toEnd = useCallback(() => goTo("navigate", lastFrame), [lastFrame, goTo]);
    const nextSpeed = useCallback(() => {
        const newSpeed = speed >= 16 ? 1 : speed * 2;
        setSpeed(newSpeed);
        speedChange(newSpeed);
    }, [speed, speedChange]);

    const data = useMemo<SolutionPlayerRef>(() => ({
        play,
        speed,
        frame,
        lastFrame,
        togglePlay,
        navigate: (toFrame: number) => goTo("navigate", toFrame),
        next: toNext,
        prev: toPrev,
        toBegin,
        toEnd,
        nextSpeed,
    }), [play, speed, frame, lastFrame, goTo, togglePlay, toNext, toPrev, toBegin, toEnd, nextSpeed]);
    useImperativeHandle(ref, () => data, [data]);

    const onFrameChange = useCallback(
        (_: React.ChangeEvent<{}>, value: number | number[]) => {
            if (!play) {
                goTo("navigate", value as number);
            }
        },
        [play, goTo]);

    return (
        <Box {...boxProps}>
            <Grid container direction="column">
                <Grid container item direction="row" alignItems="center" justify="center" spacing={2} xs>
                    <Grid item xs={2}>
                        <Button onClick={toBegin} disabled={disabled} fullWidth>
                            <SkipPrevious />
                        </Button>
                    </Grid>
                    <Grid item xs={2}>
                        <Button onClick={toPrev} disabled={disabled} fullWidth>
                            <ArrowBack />
                        </Button>
                    </Grid>
                    <Grid item xs={2}>
                        <Button onClick={togglePlay} disabled={disabled} fullWidth>
                            {play && <PauseSharp />}
                            {!play && <PlayArrow />}
                        </Button>
                    </Grid>
                    <Grid item xs={2}>
                        <Badge
                            color="secondary"
                            badgeContent={speed === 1 ? null : `x${speed}`}
                            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                        >
                            <Button onClick={nextSpeed} disabled={disabled} fullWidth>
                                <FastForwardSharp />
                            </Button>
                        </Badge>
                    </Grid>
                    <Grid item xs={2}>
                        <Button onClick={toNext} disabled={disabled} fullWidth>
                            <ArrowForward />
                        </Button>
                    </Grid>
                    <Grid item xs={2}>
                        <Button onClick={toEnd} disabled={disabled} fullWidth>
                            <SkipNext />
                        </Button>
                    </Grid>
                </Grid>
                <Grid item xs>
                    <Slider
                        defaultValue={0}
                        aria-labelledby="frame-slider"
                        step={1}
                        marks
                        min={0}
                        max={lastFrame}
                        value={frame}
                        onChange={onFrameChange}
                        valueLabelDisplay="off"
                        disabled={disabled || play}
                    />
                </Grid>
            </Grid>
        </Box>
    );
});
