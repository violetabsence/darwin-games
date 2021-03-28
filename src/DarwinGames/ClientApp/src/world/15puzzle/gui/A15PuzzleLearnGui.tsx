import React, { useState } from "react";

import { A15PuzzleDisplay, A15PuzzleSettingsBlock, A15PuzzleSolutionFormatter } from ".";
import { LearnGui } from "../../../gui";
import { GenerationInfoFormatter } from "../../../gui/components";
import { A15PuzzleLearnService, A15PuzzleLearnSettings } from "../learn";

export const A15PuzzleLearnGui = (): JSX.Element => {
    const [service] = useState(() => new A15PuzzleLearnService());
    const [settings, setSettings] = useState<A15PuzzleLearnSettings>(() => ({
        maxGenerationCount: 5000,
        skipGenerationCount: 50,
        populationSize: 15,
        maxAge: 5,
        puzzleWidth: 4,
        puzzleHeight: 4,
    }));
    const updateSettings = (value: Partial<A15PuzzleLearnSettings>) => setSettings((s) => Object.assign({}, s, value));

    return (
        <LearnGui
            settings={settings}
            updateSettings={updateSettings}
            runLearning={service.runLearning}
            displayElement={A15PuzzleDisplay}
            settingsElement={A15PuzzleSettingsBlock}
            generationFormatElement={GenerationInfoFormatter}
            solutionFormatElement={A15PuzzleSolutionFormatter}
        />
    );
};
