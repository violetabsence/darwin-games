import React from "react";

import { IndividualInfoFormatter } from "../../../gui/components";
import { TooltipFormatProps } from "../../../gui/TooltipFormatElement";
import { Solution } from "../learn";

export function SnakeSolutionFormatter(props: TooltipFormatProps<Solution>): JSX.Element {
    const { value: { field, moves, lose, ...restValue } } = props;
    return (
        <React.Fragment>
            <IndividualInfoFormatter value={restValue} />
            <div>M:{moves.length} / {lose ? "LOSE" : "WIN"}</div>
        </React.Fragment>
    );
}
