import { CssBaseline, Container } from "@material-ui/core";
import React from "react";

import { A15PuzzleLearnGui } from "./world/15puzzle/gui";

// TODO: Configure linter. Especial: line breaks, extra new lines, named import alphabetical.
// TODO: Get rid of zombie Node.js processes.

export const App = () => {
    return (
        <Container component="main" maxWidth="lg">
            <CssBaseline />
            <A15PuzzleLearnGui />
        </Container>
    );
};
