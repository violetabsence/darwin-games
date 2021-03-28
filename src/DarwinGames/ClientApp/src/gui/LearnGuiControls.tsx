import { Button, Grid, LinearProgress, Slider, Tooltip, Typography, ValueLabelProps } from "@material-ui/core";
import React, { useCallback, useEffect, useState } from "react";

import { StopLearn } from "../learn";
import { SettingsElement } from "./SettingsElement";
import { SettingsUpdater } from "./SettingsUpdater";
import { TooltipFormatElement } from "./TooltipFormatElement";

const ValueLabelComponent = (props: ValueLabelProps) =>
    <Tooltip open={props.open} enterTouchDelay={0} placement="top" title={props.value}>
        {props.children}
    </Tooltip>;

type Props<TSettings, TGeneration, TSolution> = {
    learn: () => StopLearn;
    generation: number,
    getGeneration: (index: number) => TGeneration | undefined,
    setGeneration: (index: number) => void,
    maxGeneration: number,
    generationFormat?: TooltipFormatElement<TGeneration>,
    solution: number,
    getSolution: (index: number) => TSolution | undefined,
    setSolution: (index: number) => void,
    maxSolution: number,
    solutionFormat?: TooltipFormatElement<TSolution>,
    settings: TSettings,
    updateSettings?: SettingsUpdater<TSettings>,
    settingsElement?: SettingsElement<TSettings>,
    progress?: number | "indeterminate" | "finished",
};

export function LearnGuiControls<TSettings, TGeneration, TSolution>(props: Props<TSettings, TGeneration, TSolution>)
    : JSX.Element {
    const { learn, getGeneration, setGeneration, generationFormat, getSolution, setSolution, solutionFormat } = props;
    const [inProgress, setInProgress] = useState(false);

    const start = useCallback(() => setInProgress(true), []);
    const stop = useCallback(() => setInProgress(false), []);
    useEffect(() => {
        if (props.progress === "finished") {
            stop();
        }
    }, [props.progress, stop]);
    useEffect(() => inProgress ? learn() : undefined, [learn, inProgress]);

    const onGenerationChange = useCallback(
        (_: React.ChangeEvent<{}>, value: number | number[]) => setGeneration(value as number),
        [setGeneration]);
    const onSolutionChange = useCallback(
        (_: React.ChangeEvent<{}>, value: number | number[]) => setSolution(value as number),
        [setSolution]);

    const generationLabelFormat = useCallback(
        (index: number) => {
            const value = getGeneration(index);
            return value !== undefined ? generationFormat?.({ value }) ?? index : "none";
        },
        [getGeneration, generationFormat]);
    const solutionLabelFormat = useCallback(
        (index: number) => {
            const value = getSolution(index);
            return value !== undefined ? solutionFormat?.({ value }) ?? index : "none";
        },
        [getSolution, solutionFormat]);

    const progressVariant = props.progress === "indeterminate"
        ? "indeterminate"
        : typeof props.progress === "number" && inProgress
            ? "buffer"
            : "determinate";
    const progressValue = props.progress === "finished"
        ? 100
        : props.progress === "indeterminate"
            ? 0
            : Math.min(100, props.progress ?? 0);
    const progressValueBuffer = Math.min(100, progressValue + 1);

    return (
        <React.Fragment>
            <Grid item xs>
                <Typography id="generation-slider" gutterBottom>
                    Generation
                </Typography>
                <Slider
                    defaultValue={0}
                    aria-labelledby="generation-slider"
                    step={1}
                    marks
                    min={0}
                    max={props.maxGeneration}
                    value={props.generation}
                    onChange={onGenerationChange}
                    valueLabelDisplay="auto"
                    valueLabelFormat={generationLabelFormat}
                    ValueLabelComponent={ValueLabelComponent}
                />
            </Grid>
            <Grid item>
                <Typography id="solution-slider" gutterBottom>
                    Solution
                </Typography>
                <Slider
                    defaultValue={0}
                    aria-labelledby="solution-slider"
                    step={1}
                    marks
                    min={0}
                    max={props.maxSolution}
                    value={props.solution}
                    onChange={onSolutionChange}
                    valueLabelDisplay="auto"
                    valueLabelFormat={solutionLabelFormat}
                    ValueLabelComponent={ValueLabelComponent}
                />
            </Grid>
            {props.settingsElement !== undefined && (
                <Grid item>
                    {props.updateSettings === undefined && (
                        <Typography variant="subtitle1" component="span" color="error">
                            Settings setter is not defined.
                        </Typography>
                    )}
                    {props.updateSettings !== undefined && props.settingsElement({
                        settings: props.settings,
                        update: props.updateSettings,
                        disabled: inProgress,
                    })}
                </Grid>
            )}
            <Grid container item direction="row" alignItems="center" spacing={2}>
                <Grid item xs>
                    <Button onClick={start} variant="contained" disabled={inProgress} fullWidth>
                        Learn
                    </Button>
                </Grid>
                <Grid item xs>
                    <Button onClick={stop} variant="contained" disabled={!inProgress} fullWidth>
                        Stop
                    </Button>
                </Grid>
            </Grid>
            <Grid item>
                <LinearProgress
                    variant={progressVariant}
                    value={progressValue}
                    valueBuffer={progressValueBuffer}
                />
            </Grid>
        </React.Fragment>
    );
};
