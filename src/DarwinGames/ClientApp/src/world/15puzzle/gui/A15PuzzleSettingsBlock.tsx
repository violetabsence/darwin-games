import { Grid, TextField } from "@material-ui/core";
import React, { useCallback } from "react";

import { CommonSettingsBlock } from "../../../gui/components";
import { SettingsElementProps } from "../../../gui/SettingsElement";
import { setFromInput } from "../../../utils/setFromInput";
import { A15PuzzleLearnSettings } from "../learn";

export type A15PuzzleSettingsBlockProps = SettingsElementProps<A15PuzzleLearnSettings>;

export const A15PuzzleSettingsBlock = (props: A15PuzzleSettingsBlockProps) => {
    const { settings, update, disabled } = props;
    const setPuzzleWidth = useCallback((puzzleWidth: number) => update({ puzzleWidth }), [update]);
    const setPuzzleHeight = useCallback((puzzleHeight: number) => update({ puzzleHeight }), [update]);

    return (
        <React.Fragment>
            <CommonSettingsBlock {...props} />
            <Grid container direction="row" alignItems="center" spacing={2}>
                <Grid item xs>
                    <TextField
                        type="number"
                        label="Width"
                        InputProps={{
                            inputProps: {
                                min: 0,
                                max: 100,
                            },
                        }}
                        value={settings.puzzleWidth}
                        onChange={setFromInput(setPuzzleWidth)}
                        disabled={disabled}
                        fullWidth
                    />
                </Grid>
                <Grid item xs>
                    <TextField
                        type="number"
                        label="Height"
                        InputProps={{
                            inputProps: {
                                min: 0,
                                max: 100,
                            },
                        }}
                        value={settings.puzzleHeight}
                        onChange={setFromInput(setPuzzleHeight)}
                        disabled={disabled}
                        fullWidth
                    />
                </Grid>
            </Grid>
        </React.Fragment>
    );
};
