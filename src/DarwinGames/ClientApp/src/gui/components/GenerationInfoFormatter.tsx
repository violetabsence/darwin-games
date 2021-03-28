import React from "react";

import { GenerationInfo } from "../../learn";
import { TooltipFormatProps } from "../TooltipFormatElement";

export function GenerationInfoFormatter<TGeneration extends GenerationInfo>(
    props: TooltipFormatProps<TGeneration>): JSX.Element {
    const { value: v } = props;
    return (
        <React.Fragment>
            <div>
                G:{v.index} / B:{v.bestFitness.toFixed(2)}
                {v.final === false && ` / W:${v.worstFitness.toFixed(2)}`}
            </div>
            {v.final === true && <div>FINAL</div>}
            {v.final === false && (
                <div>P:{v.propagation.parents} / O:{v.propagation.parents} / N:{v.propagation.new}</div>
            )}
        </React.Fragment>
    );
}
