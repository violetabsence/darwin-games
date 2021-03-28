import { Problem } from "../../definitions";
import { getOrAwait } from "../../utils";

export function problemPerGeneration<TPhenotype>(factory: Problem<TPhenotype>): Problem<TPhenotype> {
    let lastGeneration = -1;
    let problem: TPhenotype;

    return async (generation) => {
        if (generation !== lastGeneration) {
            const newProblem = await getOrAwait(factory(generation));
            if (generation !== lastGeneration) {
                problem = newProblem;
                lastGeneration = generation;
            }
        }

        return problem;
    };
}
