import React from "react";

import { IndividualInfo } from "../../learn";
import { TooltipFormatProps } from "../TooltipFormatElement";

export function IndividualInfoFormatter<TSolution extends IndividualInfo>(
    props: TooltipFormatProps<TSolution>): JSX.Element {
    const { value: v } = props;
    return (
        <div>F:{v.fitness.toFixed(2)} / A:{v.age}</div>
    );
}
