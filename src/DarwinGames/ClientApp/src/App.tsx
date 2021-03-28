import { CssBaseline, Container, AppBar, Toolbar, IconButton, Typography, Button, Box } from "@material-ui/core";
import { Menu } from "@material-ui/icons";
import React, { useState } from "react";

import { A15PuzzleLearnGui } from "./world/15puzzle/gui";
import { SnakeLearnGui } from "./world/snake/gui";

// TODO: Configure linter. Especial: line breaks, extra new lines, named import alphabetical.
// TODO: Get rid of zombie Node.js processes.

export const App = () => {
    const [game, setGame] = useState<"15puzzle" | "snake">("15puzzle");
    const play15puzzle = () => setGame("15puzzle");
    const playSnake = () => setGame("snake");

    return (
        <Container component="main" maxWidth="lg">
            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" color="inherit" aria-label="menu">
                        <Menu />
                    </IconButton>
                    <Typography variant="h6">
                        Darwin Games
                    </Typography>
                    <Box ml={3}>
                        <Button color="inherit" onClick={play15puzzle}>15 Puzzle</Button>
                        <Button color="inherit" onClick={playSnake}>Snake</Button>
                    </Box>
                </Toolbar>
            </AppBar>
            <CssBaseline />
            {game === "15puzzle" && <A15PuzzleLearnGui />}
            {game === "snake" && <SnakeLearnGui />}
        </Container>
    );
};
