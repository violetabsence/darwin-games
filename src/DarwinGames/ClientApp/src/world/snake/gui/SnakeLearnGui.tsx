import React, { useState } from "react";

import { SnakeDisplay, SnakeSettingsBlock, SnakeSolutionFormatter } from ".";
import { LearnGui } from "../../../gui";
import { GenerationInfoFormatter } from "../../../gui/components";
import { SnakeGame } from "../game";
import { SnakeLearnService, SnakeLearnSettings } from "../learn";

export const SnakeLearnGui = (): JSX.Element => {
    const [service] = useState(() => new SnakeLearnService());
    const [settings, setSettings] = useState<SnakeLearnSettings>(() => ({
        maxGenerationCount: 5000,
        skipGenerationCount: 50,
        populationSize: 15,
        maxAge: 5,
        puzzleWidth: SnakeGame.MinSize,
        puzzleHeight: SnakeGame.MinSize,
    }));
    const updateSettings = (value: Partial<SnakeLearnSettings>) => setSettings((s) => Object.assign({}, s, value));

    return (
        <LearnGui
            settings={settings}
            updateSettings={updateSettings}
            runLearning={service.runLearning}
            displayElement={SnakeDisplay}
            settingsElement={SnakeSettingsBlock}
            generationFormatElement={GenerationInfoFormatter}
            solutionFormatElement={SnakeSolutionFormatter}
        />
    );
};
