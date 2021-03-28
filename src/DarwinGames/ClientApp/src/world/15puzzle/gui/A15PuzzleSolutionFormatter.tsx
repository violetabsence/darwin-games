import React from "react";

import { IndividualInfoFormatter } from "../../../gui/components";
import { TooltipFormatProps } from "../../../gui/TooltipFormatElement";
import { Solution } from "../learn";

export function A15PuzzleSolutionFormatter(props: TooltipFormatProps<Solution>): JSX.Element {
    const { value: { puzzle, moves, lose, ...restValue } } = props;
    return (
        <React.Fragment>
            <IndividualInfoFormatter value={restValue} />
            <div>M:{moves.length} / {lose ? "LOSE" : "WIN"}</div>
        </React.Fragment>
    );
}
