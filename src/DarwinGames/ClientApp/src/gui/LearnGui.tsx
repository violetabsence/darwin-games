import { Box, Grid, Typography } from "@material-ui/core";
import React, { useCallback, useMemo, useReducer, useState } from "react";

import { Learn } from "../learn";
import { ElementRenderer } from "./ElementRenderer";
import { LearnGuiControls } from "./LearnGuiControls";
import { LearnGuiInitialState, LearnGuiReducer, LearnGuiReducerType } from "./LearnGuiReducer";
import { SettingsElement } from "./SettingsElement";
import { TooltipFormatElement } from "./TooltipFormatElement";

export type DisplayElementProps<TGeneration, TSolution> = {
    generations: TGeneration[],
    solutions?: TSolution[],
    selected?: TSolution,
};
export type DisplayElement<TGeneration, TSolution> = ElementRenderer<DisplayElementProps<TGeneration, TSolution>>;

// TODO: Allow to provide different problems to solutions.
// TODO: Allow to import/export solutions.

export type LearnGuiProps<TSettings, TGeneration, TSolution> = {
    settings: TSettings,
    updateSettings: (value: Partial<TSettings>) => void,
    runLearning: Learn<TSettings, TGeneration, TSolution>,
    displayElement?: DisplayElement<TGeneration, TSolution>,
    settingsElement?: SettingsElement<TSettings>,
    generationFormatElement?: TooltipFormatElement<TGeneration>,
    solutionFormatElement?: TooltipFormatElement<TSolution>,
};

export function LearnGui<TSettings, TGeneration, TSolution>(
    props: LearnGuiProps<TSettings, TGeneration, TSolution>): JSX.Element {
    const { settings, updateSettings, runLearning } = props;
    const [progress, setProgress] = useState<number | "indeterminate" | "finished">();
    const [state, dispatch] = useReducer<LearnGuiReducerType<TGeneration, TSolution>>(
        LearnGuiReducer,
        LearnGuiInitialState);

    const start = useCallback(() => {
        setProgress(0);
        dispatch({ kind: "clear" });

        const terminate = runLearning(settings, (e) => {
            switch (e.kind) {
                case "add-generation":
                    dispatch({
                        kind: "set-generation",
                        index: e.index,
                        generation: e.generation,
                        solutions: e.solutions,
                    });
                    break;
                case "set-winner":
                    dispatch({
                        kind: "set-generation",
                        index: e.index,
                        generation: e.generation,
                        solutions: [e.winner],
                    });
                    setProgress("finished");
                    break;
                case "progress":
                    setProgress(e.progress);
                    break;
            }
        });
        return () => terminate();
    }, [settings, runLearning]);

    const getGeneration = useCallback((index: number) => state.generations[index], [state]);
    const setGeneration = useCallback((index: number) => dispatch({ kind: "select-generation", index }), []);
    const maxGeneration = Math.max(0, state.generations.length - 1);
    const getSolution = useCallback((index: number) => state.solutions?.[index], [state]);
    const setSolution = useCallback((index: number) => dispatch({ kind: "select-solution", index }), []);
    const maxSolution = Math.max(0, (state.solutions?.length ?? 0) - 1);
    const selected = useMemo(() => state.solutions?.[state.solutionIndex], [state.solutions, state.solutionIndex]);

    return (
        <Box p={4}>
            <Grid container direction="row" alignItems="flex-start" justify="space-evenly" spacing={4}>
                <Grid container item xs={4} direction="column" spacing={4}>
                    <LearnGuiControls
                        learn={start}
                        generation={state.generationIndex}
                        getGeneration={getGeneration}
                        setGeneration={setGeneration}
                        maxGeneration={maxGeneration}
                        generationFormat={props.generationFormatElement}
                        solution={state.solutionIndex}
                        getSolution={getSolution}
                        setSolution={setSolution}
                        maxSolution={maxSolution}
                        solutionFormat={props.solutionFormatElement}
                        settings={settings}
                        updateSettings={updateSettings}
                        settingsElement={props.settingsElement}
                        progress={progress}
                    />
                </Grid>
                <Grid container item xs={7} direction="row" spacing={4}>
                    {props.displayElement === undefined && (
                        <Typography variant="subtitle1" component="span" color="error">
                            Display is not defined.
                        </Typography>
                    )}
                    {props.displayElement !== undefined && (
                        props.displayElement({
                            generations: state.generations,
                            solutions: state.solutions,
                            selected,
                        })
                    )}
                </Grid>
            </Grid>
        </Box>
    );
};
