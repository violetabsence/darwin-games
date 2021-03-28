import { Grid, TextField } from "@material-ui/core";
import React, { useCallback } from "react";

import { CommonSettings } from "../../learn";
import { setFromInput } from "../../utils/setFromInput";
import { SettingsElementProps } from "../SettingsElement";

export type CommonSettingsBlockProps = SettingsElementProps<CommonSettings>;

export const CommonSettingsBlock = (props: CommonSettingsBlockProps) => {
    const { settings, update, disabled } = props;
    const setMaxGenerationCount = useCallback((maxGenerationCount: number) => update({ maxGenerationCount }), [update]);
    const setSkipGenerationCount = useCallback(
        (skipGenerationCount: number) => update({ skipGenerationCount }),
        [update]);
    const setPopulationSize = useCallback((populationSize: number) => update({ populationSize }), [update]);
    const setMaxAge = useCallback((maxAge: number) => update({ maxAge }), [update]);

    return (
        <React.Fragment>
            <Grid container direction="row" alignItems="center" spacing={2}>
                <Grid item xs>
                    <TextField
                        type="number"
                        label="Generations"
                        InputProps={{
                            inputProps: {
                                min: 0,
                            },
                        }}
                        value={settings.maxGenerationCount}
                        onChange={setFromInput(setMaxGenerationCount)}
                        disabled={disabled}
                        fullWidth
                    />
                </Grid>
                <Grid item xs>
                    <TextField
                        type="number"
                        label="Skip"
                        InputProps={{
                            inputProps: {
                                min: 0,
                            },
                        }}
                        value={settings.skipGenerationCount}
                        onChange={setFromInput(setSkipGenerationCount)}
                        disabled={disabled}
                        fullWidth
                    />
                </Grid>
            </Grid>
            <Grid container direction="row" alignItems="center" spacing={2}>
                <Grid item xs>
                    <TextField
                        type="number"
                        label="Population"
                        InputProps={{
                            inputProps: {
                                min: 1,
                                max: 100,
                            },
                        }}
                        value={settings.populationSize}
                        onChange={setFromInput(setPopulationSize)}
                        disabled={disabled}
                        fullWidth
                    />
                </Grid>
                <Grid item xs>
                    <TextField
                        type="number"
                        label="Max Age"
                        InputProps={{
                            inputProps: {
                                min: 0,
                                max: 100,
                            },
                        }}
                        value={settings.maxAge}
                        onChange={setFromInput(setMaxAge)}
                        disabled={disabled}
                        fullWidth
                    />
                </Grid>
            </Grid>
        </React.Fragment>
    );
};
